# Zadanie 5. Uzdrowisko (czerwiec 2024, stara formuła) – dane jak 2024-czerwiec-7.
import json
import runpy
from pathlib import Path

r = runpy.run_path(str(Path(__file__).with_name('_alias.py')))['results']('2024-czerwiec-7')
print(json.dumps({'5.1': r['7.1'], '5.2': r['ciag-przyjazdow'], '5.3': r['7.2'], '5.4': r['7.3']}))
