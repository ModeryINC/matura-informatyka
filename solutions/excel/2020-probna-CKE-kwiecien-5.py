# Zadanie 5. Zbiornik wody (próbna CKE, kwiecień 2020) – wzorcowe obliczenia do klucza.
import json
import math
from collections import defaultdict
from datetime import date, timedelta

rows = []
with open('pogoda.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            t, rain = line.rstrip('\r\n').split('\t')
            rows.append((float(t.replace(',', '.')), float(rain.replace(',', '.'))))

START, FULL = date(2015, 4, 1), 25000
cold = sum(1 for t, _ in rows if t <= 15)
dry_warm = sum(1 for t, r in rows if t > 15 and r <= 0.6)
wet_warm = sum(1 for t, r in rows if t > 15 and r > 0.6)

level, added, first, monthly = FULL, 0, None, defaultdict(int)
for i, (t, rain) in enumerate(rows):
    day = START + timedelta(days=i)
    if rain > 0:
        level = min(FULL, level + 700 * rain)
    else:
        level -= math.ceil(0.0003 * t ** 1.5 * level - 1e-9)
    if t > 15 and rain <= 0.6:
        need = 24000 if t > 30 else 12000
        if level < need:
            refill = math.ceil(FULL - level - 1e-9)
            added += refill
            monthly[day.month] += refill
            first = first or (day, refill)
            level = FULL
        level -= need
assert added == 743427, added

print(json.dumps({
    '5.1': [str(cold), str(dry_warm), str(wet_warm)],
    '5.2': [first[0].isoformat(), str(first[1])],
    '5.4': {'table': [[f'{math.ceil(monthly[m] / 1000) * 11.74:.2f}'] for m in range(4, 10)]},
}))
