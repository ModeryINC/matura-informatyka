# Zadanie 5. Recykling (czerwiec 2026, stara formuła) – te same dane co 2026-czerwiec-7.
import json
import runpy
from pathlib import Path

r = runpy.run_path(str(Path(__file__).with_name('_alias.py')))['results']('2026-czerwiec-7')
print(json.dumps({
    '5.1': [r['7.1'][0]],
    '5.2': r['7.2'],
    '5.3': r['7.3'],
    '5.4': r['mniej-niz-3900'],
    '5.5': r['7.4'],
    '5.6': r['7.5'],
}))
