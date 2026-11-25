# Zadanie 5. Pomiary temperatury (czerwiec 2018) – wzorcowe obliczenia do klucza.
import json
import math
from collections import Counter, defaultdict
from datetime import date
from decimal import ROUND_FLOOR, Decimal

rows = []
with open('pomiary.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            day, hour, *temps = line.strip().split(';')
            rows.append((date.fromisoformat(day), hour, [Decimal(t.replace(',', '.')) for t in temps]))

morning = [t[4] for _, h, t in rows if '05:00' <= h.zfill(5) <= '12:00']
avg5 = sum(morning) / len(morning)

modes = []
for s in range(10):
    counts = Counter(math.floor(Decimal('273.15') + t[s]) for _, _, t in rows)
    top = max(counts.values())
    modes.append(sorted(k for k, n in counts.items() if n == top))

monthly = defaultdict(list)
for d, _, t in rows:
    if d.year == 2016:
        monthly[d.month].append(t[9])
months = sorted(monthly)
NAMES = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień',
         'wrzesień', 'październik', 'listopad', 'grudzień']

values = [v for _, _, t in rows for v in t]
low = sum(1 for v in values if -10 < v <= 15)
high = sum(1 for v in values if 15 < v <= 20)


def restored(d, temps, all_three):
    t = list(temps)
    if 5 <= d.day <= 10:
        for s in (0, 1, 8):
            t[s] -= Decimal('1.2')
    if d.month in (7, 8):
        t[7] = (t[7] * Decimal('1.07')).quantize(Decimal('0.01'), rounding=ROUND_FLOOR)
    if all_three and d.month == 5:
        t = [v + Decimal('0.9') for v in t]
    return t


def first_on(day, month):
    return next((d, t) for d, _, t in rows if d.day == day and d.month == month)


table = []
for all_three in (False, True):
    for day, month in ((5, 5), (7, 7)):
        d, t = first_on(day, month)
        r = restored(d, t, all_three)
        table.append([f'{r[s]:.2f}' for s in (0, 1, 7, 8)])

print(json.dumps({
    '5.1': [f'{avg5:.2f}'],
    '5.2': {'fields': [str(m[0]) for m in modes], 'alternatives': [[str(x) for x in m[1:]] for m in modes]},
    '5.3': {'table': [[f'{sum(monthly[m]) / len(monthly[m]):.2f}'] for m in months],
            'rows': [NAMES[m - 1] for m in months]},
    '5.4': ['(-10, 15]' if low >= high else '(15, 20]', str(max(low, high))],
    '5.5': {'table': table},
}))
