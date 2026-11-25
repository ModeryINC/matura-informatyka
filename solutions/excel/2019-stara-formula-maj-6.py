# Zadanie 6. Transport (maj 2019, stara formuła) – wzorcowe obliczenia do klucza.
import json
from collections import Counter, defaultdict
from datetime import datetime, timedelta

rows = []
with open('kursy.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            day, a, b, kg, km, pay = line.strip().split(';')
            rows.append((datetime.strptime(day, '%d-%m-%Y').date(), a, b, int(kg), int(km), int(pay)))

rate = max(rows, key=lambda r: r[5] / r[4])
long_pay = sum(r[5] for r in rows if r[4] > 400)

pairs = defaultdict(int)
for _, a, b, kg, _, _ in rows:
    pairs[(a, b)] += kg
pair = max(pairs, key=pairs.get)

dest = sorted(((n, city) for city, n in Counter(r[2] for r in rows).items() if n >= 8),
              key=lambda x: (-x[0], x[1]))

best, run = (1, 0), 1
for i in range(1, len(rows)):
    ok = rows[i][1] == rows[i - 1][2] and rows[i][0] - rows[i - 1][0] == timedelta(days=1)
    run = run + 1 if ok else 1
    if run > best[0]:
        best = (run, i - run + 1)
first, last = rows[best[1]][0], rows[best[1] + best[0] - 1][0]

print(json.dumps({
    '6.1': [rate[1], rate[2], f'{rate[5] / rate[4]:.2f}'],
    '6.2': [str(long_pay)],
    '6.3': [pair[0], pair[1], str(pairs[pair])],
    '6.4': {'table': [[str(n)] for n, _ in dest], 'rows': [c for _, c in dest]},
    '6.5': [first.isoformat(), last.isoformat()],
}))
