"""
Kod pomocniczy wykonywany w Pyodide (w Web Workerze).

Uruchamia rozwiązanie użytkownika w izolowanej przestrzeni nazw, przechwytuje
standardowe wyjście i formatuje błędy tak, aby pokazywały tylko linie
z kodu użytkownika (plik „rozwiazanie.py”).
"""
import copy
import io
import json
import math
import os
import sys
import time
import traceback

USER_FILE = "rozwiazanie.py"
MAX_OUTPUT = 200_000
STREAM_CHUNK = 4096
STREAM_INTERVAL = 0.05


def _format_exc():
    etype, value, tb = sys.exc_info()
    frames = [f for f in traceback.extract_tb(tb) if f.filename == USER_FILE]
    lines = []
    if frames:
        lines.append("Traceback (most recent call last):\n")
        lines.extend(traceback.format_list(frames))
    lines.extend(traceback.format_exception_only(etype, value))
    return "".join(lines)


class _Output(io.StringIO):
    """Bufor stdout, który opcjonalnie przekazuje tekst na bieżąco (konsola)."""

    def __init__(self, on_output=None):
        super().__init__()
        self.on_output = on_output
        self.pending = []
        self.pending_size = 0
        self.last_flush = time.monotonic()

    def write(self, text):
        written = super().write(text)
        if self.on_output is not None and text and self.tell() <= MAX_OUTPUT:
            self.pending.append(text)
            self.pending_size += len(text)
            # Grupujemy zapisy, żeby pętla z print() nie zalała wątku głównego wiadomościami.
            # Po czasie wysyłamy tylko pełne linie, żeby print(a, b) nie rwał się w konsoli.
            if self.pending_size >= STREAM_CHUNK or (
                text.endswith("\n") and time.monotonic() - self.last_flush >= STREAM_INTERVAL
            ):
                self.flush_pending()
        return written

    def flush_pending(self):
        if self.on_output is not None and self.pending:
            self.on_output("".join(self.pending))
        self.pending = []
        self.pending_size = 0
        self.last_flush = time.monotonic()


class _Capture:
    """Przechwytuje stdout; ogranicza rozmiar, żeby nie zawiesić przeglądarki."""

    def __init__(self, on_output=None):
        self.on_output = on_output

    def __enter__(self):
        self.buffer = _Output(self.on_output)
        self.old = sys.stdout
        sys.stdout = self.buffer
        return self

    def __exit__(self, *exc):
        self.buffer.flush_pending()
        sys.stdout = self.old
        return False

    @property
    def text(self):
        value = self.buffer.getvalue()
        if len(value) > MAX_OUTPUT:
            return value[:MAX_OUTPUT] + "\n… (wyjście obcięte)"
        return value


NO_INPUT = (
    "Brak danych wejściowych – wpisz je w polu „Wejście” konsoli (jedna linia na każde input())."
)


def _make_input(stdin):
    """input() czytający kolejne linie z pola „Wejście”; wpisaną wartość pokazuje w konsoli."""

    def _input(prompt=""):
        sys.stdout.write(str(prompt))
        line = stdin.readline()
        if not line:
            raise EOFError(NO_INPUT)
        value = line.rstrip("\r\n")
        sys.stdout.write(value + "\n")
        return value

    return _input


def _exec_user(code, namespace):
    exec(compile(code, USER_FILE, "exec"), namespace)


def run_program(code, workdir, stdin="", on_output=None):
    """
    Uruchamia program w katalogu z plikami danych. Zwraca JSON: stdout, error.

    `stdin` – tekst dla input() i sys.stdin; `on_output` – opcjonalna funkcja
    dostająca fragmenty wyjścia na bieżąco (konsola w przeglądarce).
    """
    os.chdir(workdir)
    error = None
    source = io.StringIO(stdin or "")
    old_stdin = sys.stdin
    sys.stdin = source
    with _Capture(on_output) as out:
        try:
            _exec_user(code, {"__name__": "__main__", "input": _make_input(source)})
        except SystemExit:
            pass
        except BaseException:  # noqa: BLE001 – chcemy pokazać każdy błąd użytkownika
            error = _format_exc()
        finally:
            sys.stdin = old_stdin
    return json.dumps({"stdout": out.text, "error": error}, ensure_ascii=False)


def _normalize(value):
    if isinstance(value, (tuple, list)):
        return [_normalize(v) for v in value]
    if isinstance(value, dict):
        return {str(k): _normalize(v) for k, v in value.items()}
    if isinstance(value, (set, frozenset)):
        return sorted((_normalize(v) for v in value), key=repr)
    return value


def _equal(actual, expected):
    if isinstance(expected, float) or isinstance(actual, float):
        if isinstance(actual, (int, float)) and isinstance(expected, (int, float)):
            return math.isclose(actual, expected, rel_tol=1e-9, abs_tol=1e-6)
        return False
    if isinstance(expected, list):
        return (
            isinstance(actual, list)
            and len(actual) == len(expected)
            and all(_equal(a, e) for a, e in zip(actual, expected))
        )
    if isinstance(expected, dict):
        return (
            isinstance(actual, dict)
            and actual.keys() == expected.keys()
            and all(_equal(actual[k], expected[k]) for k in expected)
        )
    if isinstance(expected, bool) or isinstance(actual, bool):
        return type(actual) is type(expected) and actual == expected
    return actual == expected


def _show(value):
    try:
        return json.dumps(_normalize(value), ensure_ascii=False)
    except (TypeError, ValueError):
        return repr(value)


def run_function(code, name, tests_json):
    """Definiuje funkcję użytkownika i uruchamia na niej testy. Zwraca JSON."""
    tests = json.loads(tests_json)
    namespace = {"__name__": "__solution__"}
    with _Capture() as out:
        try:
            _exec_user(code, namespace)
        except BaseException:  # noqa: BLE001
            return json.dumps({"error": _format_exc(), "results": [], "stdout": out.text})
    fn = namespace.get(name)
    if not callable(fn):
        return json.dumps(
            {"error": f"Nie zdefiniowano funkcji {name}().", "results": [], "stdout": out.text},
            ensure_ascii=False,
        )
    results = []
    for test in tests:
        with _Capture():
            try:
                actual = fn(*copy.deepcopy(test["args"]))
                results.append(
                    {"passed": _equal(_normalize(actual), test["expected"]), "actual": _show(actual)}
                )
            except BaseException:  # noqa: BLE001
                results.append({"passed": False, "actual": "", "error": _format_exc()})
    return json.dumps({"error": None, "results": results, "stdout": out.text}, ensure_ascii=False)
