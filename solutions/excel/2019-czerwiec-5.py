# Zadanie 5. Zbiornik wody (czerwiec 2019) – te same dane co 2020-probna-CKE-kwiecien-5.
import json
import runpy
from pathlib import Path

r = runpy.run_path(str(Path(__file__).with_name('_alias.py')))['results']('2020-probna-CKE-kwiecien-5')
print(json.dumps({'5.1': r['5.2'], '5.3': r['5.4'], '5.4': r['5.1']}))
