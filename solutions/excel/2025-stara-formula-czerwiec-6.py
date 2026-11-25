# Zadanie 6. Fotowoltaika (czerwiec 2025, stara formuła) – dane jak 2025-czerwiec-6.
import json
import runpy
from pathlib import Path

r = runpy.run_path(str(Path(__file__).with_name('_alias.py')))['results']('2025-czerwiec-6')
print(json.dumps({
    '6.1': r['produkcja-miesiecznie'], '6.2': r['6.1'], '6.3': r['6.2'], '6.4': r['6.3'], '6.5': r['6.4'],
}))
