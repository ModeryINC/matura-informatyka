# Zadanie 5. Szybka myjnia automatyczna (lipiec 2020) – wzorcowe obliczenia do klucza.
import json
from collections import Counter

rows = []
with open('myjnia.txt', encoding='utf-8') as f:
    for line in f:
        if line.strip():
            gap, wash, plate = line.strip().split(';')
            rows.append((int(gap), int(wash), plate))

lengths = Counter(w for _, w, _ in rows)
cities = Counter(Counter(p[:2] for _, _, p in rows).values())

arrivals, t = [], 0
for gap, wash, plate in rows:
    t += gap
    arrivals.append((t, wash, plate))
before_20 = [a for a, _, _ in arrivals if a < 14 * 60]
last = before_20[-1]
per_hour = Counter(a // 60 + 1 for a, _, _ in arrivals)

free, resigned, streak, longest = 0, [], 0, 0
for a, wash, plate in arrivals:
    start = max(a, free)
    if start - a > 5:
        resigned.append(plate)
        streak += 1
        longest = max(longest, streak)
    else:
        free = start + wash
        streak = 0

print(json.dumps({
    '5.1': {'table': [[str(lengths[k])] for k in range(1, 16)]},
    '5.2': [str(cities[1]), str(cities[2])],
    '5.3': [str(len(before_20)), f'{6 + last // 60}:{last % 60:02d}'],
    '5.4': {'table': [[str(per_hour[h])] for h in range(1, 7)]},
    '5.5': [resigned[1], str(len(resigned)), str(longest)],
}))
