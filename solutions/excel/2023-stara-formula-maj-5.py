# Zadanie 5. Konfitury owocowe (maj 2023, stara formuła) – dane jak 2023-maj-6, dodatkowy 5.3.
import json
import runpy
from datetime import datetime
from pathlib import Path

r = runpy.run_path(str(Path(__file__).with_name('_alias.py')))['results']('2023-maj-6')

rows = []
with open('owoce.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            day, m, *_ = line.split('\t')
            rows.append((datetime.strptime(day, '%d.%m.%Y').date(), int(m)))
best = (1, 0)
start = 0
for i in range(1, len(rows) + 1):
    if i == len(rows) or rows[i][1] <= rows[i - 1][1]:
        if i - start > best[0]:
            best = (i - start, start)
        start = i
length, s = best

print(json.dumps({
    '5.1': r['6.1'], '5.2': r['6.2'],
    '5.3': [str(length), rows[s][0].isoformat(), rows[s + length - 1][0].isoformat()],
    '5.4': r['6.3'], '5.5': r['6.4'],
}))
