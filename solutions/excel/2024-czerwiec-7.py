# Zadanie 7. Uzdrowisko (czerwiec 2024) – wzorcowe obliczenia do klucza.
import json
import math
from collections import defaultdict

rows = []
with open('uzdrowisko.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            day, came, left = line.rstrip('\r\n').split('\t')
            rows.append((day, int(came), int(left)))

monthly = defaultdict(int)
for day, came, _ in rows:
    monthly[int(day[5:7])] += came

people, counts = 10000, []
for day, came, left in rows:
    people += came - left
    counts.append((day, people))
first_over = next(day for day, n in counts if n > 11000)
peak = max(counts, key=lambda c: c[1])[0]


def simulate(bottles):
    """Zwraca listę dni, w których zabrakło wody."""
    short = []
    for day, n in counts:
        need = 0.4 * n
        if need <= 3900:
            bottles += math.floor((3900 - need) / 5 + 1e-9)
        else:
            used = math.ceil((need - 3900) / 5 - 1e-9)
            if used <= bottles:
                bottles -= used
            else:
                bottles = 0
                short.append(day)
    return short


# Najdłuższy ciąg dni, w których przyjechało więcej osób, niż wyjechało (stara formuła).
best, run = (0, 0), 0
for i, (_, came, left) in enumerate(rows):
    run = run + 1 if came > left else 0
    if run > best[0]:
        best = (run, i - run + 1)

short = simulate(120)
minimum = next(b for b in range(0, 100000) if not simulate(b))

print(json.dumps({
    '7.1': {'table': [[str(monthly[m])] for m in range(1, 13)]},
    '7.2': [first_over, peak],
    '7.3': [short[0], str(len(short)), str(minimum)],
    'ciag-przyjazdow': [rows[best[1]][0], rows[best[1] + best[0] - 1][0]],
}))
