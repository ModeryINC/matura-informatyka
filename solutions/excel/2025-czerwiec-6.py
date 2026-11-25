# Zadanie 6. Fotowoltaika (czerwiec 2025) – wzorcowe obliczenia do klucza.
import json
import math
from collections import defaultdict
from datetime import datetime

rows = []
with open('fotowoltaika.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            day, up, down, cloud, prod, out, take = line.rstrip('\r\n').split('\t')
            num = lambda s: float(s.replace(',', '.'))  # noqa: E731
            rows.append((day, datetime.strptime(up, '%H:%M:%S'), datetime.strptime(down, '%H:%M:%S'),
                         int(cloud), num(prod), num(out), num(take)))

used = sum(take + prod - out for _, _, _, _, prod, out, take in rows)

# Liczymy dni spełniające warunek względem dnia poprzedniego (pierwszy dzień ciągu też).
best = (0, 0)
run = 0
for i in range(1, len(rows)):
    ok = rows[i][3] <= rows[i - 1][3] and rows[i][4] >= rows[i - 1][4]
    run = run + 1 if ok else 0
    if run > best[0]:
        best = (run, i - run + 1)

monthly = defaultdict(float)
for day, _, _, _, prod, _, _ in rows:
    monthly[int(day[5:7])] += prod

groups = defaultdict(list)
for _, up, down, _, prod, out, take in rows:
    groups[int((down - up).total_seconds() // 3600)].append((prod, out, take))
hours = sorted(groups)
table = [[f'{sum(v[k] for v in groups[h]) / len(groups[h]):.3f}' for k in range(3)] for h in hours]

balance, low, lowest = 100.0, 0, 0.0
running = 0.0
for *_, out, take in rows:
    balance += 0.8 * out - take
    running += 0.8 * out - take
    low += balance < 50
    lowest = min(lowest, running)

print(json.dumps({
    '6.1': [f'{used:.2f}'],
    '6.2': [str(best[0]), rows[best[1]][0]],
    '6.3': {'table': table, 'rows': [str(h) for h in hours]},
    '6.4': [str(low), str(math.ceil(-lowest))],
    'produkcja-miesiecznie': {'table': [[f'{monthly[m]:.2f}'] for m in range(1, 13)]},
}))
