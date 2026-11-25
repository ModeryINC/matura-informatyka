# Zadanie 5. Statek (czerwiec 2020, stara formuła) – dane jak 2020-czerwiec-6, bez podpunktu 6.3.
import json
import runpy
from pathlib import Path

r = runpy.run_path(str(Path(__file__).with_name('_alias.py')))['results']('2020-czerwiec-6')
print(json.dumps({'5.1': r['6.1'], '5.2': r['6.2'], '5.3': r['6.4'], '5.4': r['6.5']}))
