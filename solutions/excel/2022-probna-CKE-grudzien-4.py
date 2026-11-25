# Zadanie 4. EKOdom (próbna CKE, grudzień 2022) – wzorcowe obliczenia do klucza.
import json
from collections import defaultdict
from datetime import date, datetime

rows = []
with open('ekodom.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            day, water = line.rstrip('\r\n').split('\t')
            rows.append((datetime.strptime(day, '%d.%m.%Y').date(), int(water)))

best, run = (0, 0), 0
for i, (_, w) in enumerate(rows):
    run = run + 1 if w == 0 else 0
    if run > best[0]:
        best = (run, i - run + 1)

monthly = defaultdict(int)
for day, w in rows:
    monthly[day.month] += w

tank, dry, waterings, short_days, from_net = 5000, 0, 0, 0, 0
for day, w in rows:
    tank += w
    dry = dry + 1 if w == 0 else 0
    use = 260 if day.weekday() == 2 else 190
    if date(2022, 4, 1) <= day <= date(2022, 9, 30) and dry > 0 and dry % 5 == 0:
        use += 300
        waterings += 1
    if use > tank:
        short_days += 1
        from_net += use - tank
        tank = 0
    else:
        tank -= use

print(json.dumps({
    '4.1': [str(best[0]), rows[best[1]][0].isoformat(), rows[best[1] + best[0] - 1][0].isoformat(), str(waterings)],
    '4.2': {'table': [[str(monthly[m])] for m in range(1, 13)]},
    '4.3': [str(short_days), str(from_net)],
}))
