# Zadanie 4. Brenna (przykładowy arkusz CKE 2023) – wzorcowe obliczenia do klucza.
import json
from collections import Counter, defaultdict
from datetime import datetime

rows = []
with open('brenna.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            when, temp, rain = line.rstrip('\r\n').split('\t')
            rows.append((datetime.strptime(when, '%d.%m.%Y %H:%M'),
                         float(temp.replace(',', '.')), float(rain.replace(',', '.'))))

temps = defaultdict(list)
for when, t, _ in rows:
    temps[when.date()].append(t)
amp_day = max(temps, key=lambda d: max(temps[d]) - min(temps[d]))
amplitude = max(temps[amp_day]) - min(temps[amp_day])

by_hour = defaultdict(list)
for when, t, _ in rows:
    by_hour[when.hour].append(t)

best, run = (0, 0), 0
for i, (_, t, r) in enumerate(rows):
    run = run + 1 if t > 0 and r > 0 else 0
    if run > best[0]:
        best = (run, i - run + 1)
length, start = best
rain_total = sum(r for _, _, r in rows[start:start + length])

snow = 0.0
plow_next = False
plows = []
for when, t, r in rows:
    if plow_next:
        plows.append(when.date())  # pługi pracują tę godzinę; opad z tej godziny jest usuwany
        plow_next, snow = False, 0.0
        continue
    if t > 0 and r > 0:
        snow = 0.0
    elif r > 0:
        snow += r
        if snow > 4 + 1e-9:
            plow_next = True
plow_day, plow_count = Counter(plows).most_common(1)[0]

fmt = lambda w: w.strftime('%Y-%m-%d %H:%M')  # noqa: E731
print(json.dumps({
    '4.1': [amp_day.isoformat(), f'{amplitude:.1f}'],
    '4.2': {'table': [[f'{sum(by_hour[h]) / len(by_hour[h]):.2f}'] for h in range(24)]},
    '4.3': [str(length), fmt(rows[start][0]), fmt(rows[start + length - 1][0]), f'{rain_total:g}'],
    '4.4': [str(len(plows)), plow_day.isoformat(), str(plow_count)],
}))
