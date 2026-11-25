# Zadanie 6. Fotowoltaika (czerwiec 2023) – wzorcowe obliczenia do klucza.
import json
import math
from collections import Counter, defaultdict
from datetime import datetime

rows = []
with open('fotowoltaika.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            when, take, gen = line.rstrip('\r\n').split('\t')
            rows.append((datetime.strptime(when, '%d.%m.%Y %H:%M'),
                         float(take.replace(',', '.')), float(gen.replace(',', '.'))))

daily = defaultdict(float)
for when, _, gen in rows:
    daily[when.date()] += gen
best = max(daily, key=daily.get)

zero = Counter(when.hour for when, take, _ in rows if take == 0)
hour, times = zero.most_common(1)[0]

by_hour = defaultdict(list)
for when, _, gen in rows:
    by_hour[when.hour].append(gen)

need = 0.0
for when, take, gen in rows:
    if when.month == 4 and 10 <= when.hour <= 15 and take > 0:
        need = max(need, 18 * take / gen)

print(json.dumps({
    '6.1': [best.isoformat(), f'{daily[best]:.3f}'],
    '6.2': [str(hour), str(times)],
    '6.3': {'table': [[f'{sum(by_hour[h]) / len(by_hour[h]):.4f}'] for h in range(24)]},
    '6.4': [str(math.ceil(need))],
}))
