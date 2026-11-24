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
import traceback

USER_FILE = "rozwiazanie.py"
MAX_OUTPUT = 200_000


def _format_exc():
    etype, value, tb = sys.exc_info()
    frames = [f for f in traceback.extract_tb(tb) if f.filename == USER_FILE]
    lines = []
    if frames:
        lines.append("Traceback (most recent call last):\n")
        lines.extend(traceback.format_list(frames))
    lines.extend(traceback.format_exception_only(etype, value))
    return "".join(lines)


class _Capture:
    """Przechwytuje stdout; ogranicza rozmiar, żeby nie zawiesić przeglądarki."""

    def __enter__(self):
        self.buffer = io.StringIO()
        self.old = sys.stdout
        sys.stdout = self.buffer
        return self

    def __exit__(self, *exc):
        sys.stdout = self.old
        return False

    @property
    def text(self):
        value = self.buffer.getvalue()
        if len(value) > MAX_OUTPUT:
            return value[:MAX_OUTPUT] + "\n… (wyjście obcięte)"
        return value


def _exec_user(code, namespace):
    exec(compile(code, USER_FILE, "exec"), namespace)


def run_program(code, workdir):
    """Uruchamia program w katalogu z plikami danych. Zwraca JSON: stdout, error."""
    os.chdir(workdir)
    error = None
    with _Capture() as out:
        try:
            _exec_user(code, {"__name__": "__main__"})
        except SystemExit:
            pass
        except BaseException:  # noqa: BLE001 – chcemy pokazać każdy błąd użytkownika
            error = _format_exc()
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
