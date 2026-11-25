# Zadanie 5. Martianeum (maj 2025, stara formuła) – to samo co 2025-maj-6.
import json
import runpy
from pathlib import Path

r = runpy.run_path(str(Path(__file__).with_name('_alias.py')))['results']('2025-maj-6')
print(json.dumps({f'5.{i}': r[f'6.{i}'] for i in range(1, 6)}))
