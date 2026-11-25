"""Testy kodu pomocniczego Pyodide uruchamiane zwykłym Pythonem (unittest)."""
import json
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "src", "python"))
import harness  # noqa: E402


class RunProgramTest(unittest.TestCase):
    def setUp(self):
        self.cwd = os.getcwd()
        self.dir = tempfile.mkdtemp()
        with open(os.path.join(self.dir, "dane.txt"), "w", encoding="utf8") as f:
            f.write("1\n2\n3\n")

    def tearDown(self):
        os.chdir(self.cwd)

    def run_code(self, code):
        return json.loads(harness.run_program(code, self.dir))

    def test_reads_file_and_captures_stdout(self):
        out = self.run_code("print(sum(int(x) for x in open('dane.txt')))")
        self.assertEqual(out, {"stdout": "6\n", "error": None})

    def test_reports_user_traceback_only(self):
        out = self.run_code("x = 1\nprint(y)")
        self.assertIn('File "rozwiazanie.py", line 2', out["error"])
        self.assertIn("NameError", out["error"])
        self.assertNotIn("harness", out["error"])

    def test_syntax_error(self):
        out = self.run_code("print(")
        self.assertIn("SyntaxError", out["error"])

    def test_exit_is_not_an_error(self):
        out = self.run_code("print(1)\nexit()\nprint(2)")
        self.assertEqual(out, {"stdout": "1\n", "error": None})

    def test_input_reads_lines_and_echoes_them(self):
        code = "a = input('a=')\nb = input()\nprint(int(a) + int(b))"
        out = json.loads(harness.run_program(code, self.dir, "2\n3\n"))
        self.assertEqual(out, {"stdout": "a=2\n3\n5\n", "error": None})

    def test_sys_stdin_is_available(self):
        code = "import sys\nprint(sys.stdin.read().split())"
        out = json.loads(harness.run_program(code, self.dir, "1 2\n"))
        self.assertEqual(out["stdout"], "['1', '2']\n")

    def test_missing_input_is_explained(self):
        out = self.run_code("input('n=')")
        self.assertIn("EOFError", out["error"])
        self.assertIn("Wejście", out["error"])

    def test_output_is_streamed(self):
        chunks = []
        code = "for i in range(3):\n    print(i)\nprint('x' * 5000)"
        out = json.loads(harness.run_program(code, self.dir, "", chunks.append))
        self.assertEqual("".join(chunks), out["stdout"])
        self.assertGreaterEqual(len(chunks), 2)

    def test_output_is_truncated(self):
        out = self.run_code("print('x' * 300000)")
        self.assertTrue(out["stdout"].endswith("(wyjście obcięte)"))


class RunFunctionTest(unittest.TestCase):
    def run_fn(self, code, name, tests):
        return json.loads(harness.run_function(code, name, json.dumps(tests)))

    def test_passing_and_failing_tests(self):
        out = self.run_fn(
            "def f(a, b):\n    return a + b if a < 5 else 0",
            "f",
            [{"args": [1, 2], "expected": 3}, {"args": [5, 1], "expected": 6}],
        )
        self.assertIsNone(out["error"])
        self.assertEqual([r["passed"] for r in out["results"]], [True, False])
        self.assertEqual(out["results"][1]["actual"], "0")

    def test_tuples_floats_and_bools(self):
        code = "def f(x):\n    return (x, x / 3, x > 0)"
        out = self.run_fn(code, "f", [{"args": [1], "expected": [1, 0.3333333333, True]}])
        self.assertTrue(out["results"][0]["passed"])
        out = self.run_fn("def f():\n    return 1", "f", [{"args": [], "expected": True}])
        self.assertFalse(out["results"][0]["passed"])

    def test_arguments_are_copied(self):
        code = "def f(t):\n    t.append(1)\n    return len(t)"
        tests = [{"args": [[]], "expected": 1}, {"args": [[]], "expected": 1}]
        out = self.run_fn(code, "f", tests)
        self.assertEqual([r["passed"] for r in out["results"]], [True, True])

    def test_missing_function(self):
        out = self.run_fn("x = 1", "f", [{"args": [], "expected": 1}])
        self.assertIn("Nie zdefiniowano funkcji f()", out["error"])

    def test_exception_inside_function(self):
        out = self.run_fn("def f():\n    return 1 // 0", "f", [{"args": [], "expected": 1}])
        self.assertIn("ZeroDivisionError", out["results"][0]["error"])


if __name__ == "__main__":
    unittest.main()
