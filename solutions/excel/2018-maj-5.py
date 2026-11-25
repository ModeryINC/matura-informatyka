# Zadanie 5. Zbiornik (maj 2018) – wzorcowe obliczenia do klucza.
import json
import math
from collections import defaultdict
from datetime import date

rows = []
with open('woda.txt', encoding='utf-8') as f:
    for line in f:
        if line.strip():
            day, m3 = line.split()
            rows.append((date.fromisoformat(day), int(m3)))

yearly = defaultdict(int)
for day, m3 in rows:
    yearly[day.year] += m3
best_year = max(yearly, key=yearly.get)

best, run = (0, 0), 0
for i, (_, m3) in enumerate(rows):
    run = run + 1 if m3 >= 10000 else 0
    if run > best[0]:
        best = (run, i - run + 1)

monthly = defaultdict(int)
for day, m3 in rows:
    if day.year == 2008:
        monthly[day.month] += m3


def simulate(limit=True):
    level, first_overflow, high_days, peak = 500000, None, 0, 0
    for day, m3 in rows:
        measured = level  # pomiar zaraz po północy
        peak = max(peak, measured)
        if day == date(2008, 2, 1):
            assert measured == 338406, measured
        high_days += measured >= 800000
        if limit and measured > 1000000:
            first_overflow = first_overflow or day
            level = 1000000
        level -= math.ceil(0.02 * measured - 1e-9)
        level += m3
    return first_overflow, high_days, peak


first_overflow, high_days, _ = simulate()
_, _, peak = simulate(limit=False)

print(json.dumps({
    '5.1': [str(best_year)],
    '5.2': [rows[best[1]][0].isoformat(), rows[best[1] + best[0] - 1][0].isoformat()],
    '5.3': {'table': [[str(monthly[m])] for m in range(1, 13)]},
    '5.4': [first_overflow.isoformat(), str(high_days), str(peak)],
}))
