"""Wspólne: uruchamia obliczenia innego zadania i zwraca ich wynik (słownik).

Używane przez zadania starej formuły, które mają te same dane co zadanie nowej
formuły, ale inną numerację podpunktów.
"""
import contextlib
import io
import json
import runpy
from pathlib import Path


def results(task_id):
    buffer = io.StringIO()
    with contextlib.redirect_stdout(buffer):
        runpy.run_path(str(Path(__file__).with_name(f'{task_id}.py')), run_name='__main__')
    return json.loads(buffer.getvalue())
