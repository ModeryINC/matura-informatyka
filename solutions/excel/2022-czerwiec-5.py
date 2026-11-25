# Zadanie 5. Plażowy biznes (czerwiec 2022) – wzorcowe obliczenia do klucza.
import json
import math
from collections import defaultdict
from datetime import date, timedelta

rows = []
with open('temperatury.txt', encoding='utf-8') as f:
    for line in f:
        if line.strip():
            day, t = line.strip().split(';')
            rows.append((date.fromisoformat(day), int(t)))

# produkt: (sprzedaż pierwszego dnia p, współczynnik w, cena)
PRODUCTS = {'hot-dog': (90, 1 / 13, 7), 'lody': (120, 2 / 29, 5), 'kukurydza': (80, 1 / 17, 6)}


def sales(t):
    return {k: math.floor(p * (1 + w * (t - 24) / 2) + 1e-9) for k, (p, w, _) in PRODUCTS.items()}


def revenue(t, extra=0.0):
    return sum(n * (PRODUCTS[k][2] + extra) for k, n in sales(t).items())


best, run = (0, 0), 0
for i, (_, t) in enumerate(rows):
    run = run + 1 if t > 20 else 0
    if run > best[0]:
        best = (run, i - run + 1)

monthly = defaultdict(lambda: defaultdict(int))
for day, t in rows:
    for k, n in sales(t).items():
        monthly[day.month][k] += n

total = 0
for day, t in rows:
    total += revenue(t)
    if total > 45000:
        over = (day, total)
        break

september = [(date(2022, 9, 1) + timedelta(days=i), 23 - i // 2) for i in range(30)]
low = next(d for d, t in september if revenue(t) < 1000)
need = max((1000 - revenue(t)) / sum(sales(t).values()) for _, t in september)
need = math.ceil(need * 100 - 1e-9) / 100

print(json.dumps({
    '5.1': [rows[best[1]][0].isoformat(), rows[best[1] + best[0] - 1][0].isoformat()],
    '5.2': {'table': [[str(monthly[m][k]) for k in ('lody', 'kukurydza', 'hot-dog')] for m in (6, 7, 8)]},
    '5.3': [over[0].isoformat(), str(round(over[1]))],
    '5.4': [low.isoformat(), f'{need:.2f}'],
}))
