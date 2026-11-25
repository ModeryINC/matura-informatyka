# Zadanie 5. Sok (maj 2022) – wzorcowe obliczenia do klucza.
import json
from collections import Counter, defaultdict
from datetime import datetime, timedelta

orders = []
with open('soki.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            nr, day, where, size = line.rstrip('\r\n').split('\t')
            orders.append((int(nr), datetime.strptime(day, '%d.%m.%Y').date(), where, int(size)))

count = Counter(w for _, _, w, _ in orders)
total = defaultdict(int)
for _, _, w, s in orders:
    total[w] += s
houses = sorted(count)

ogro = sorted({d for _, d, w, _ in orders if w == 'Ogrodzieniec'})
best, run = (1, 0), 1
for i in range(1, len(ogro)):
    run = run + 1 if ogro[i] - ogro[i - 1] == timedelta(days=1) else 1
    if run > best[0]:
        best = (run, i - run + 1)

by_day = defaultdict(list)
for o in orders:
    by_day[o[1]].append(o)
first, last = min(by_day), max(by_day)


def simulate(weekday_production):
    stock, sent = 30000, []
    day = first
    while day <= last:
        stock += weekday_production if day.weekday() < 5 else 5000
        for nr, d, _, size in by_day.get(day, []):
            if size <= stock:
                stock -= size
            else:
                sent.append((nr, d, size))
        day += timedelta(days=1)
    return sent


sent = simulate(12000)
minimum = next(p for p in range(12000, 100000) if not simulate(p))

print(json.dumps({
    '5.1': {'table': [[str(count[h])] for h in houses], 'rows': houses},
    '5.2': [str(best[0]), ogro[best[1]].isoformat(), ogro[best[1] + best[0] - 1].isoformat()],
    '5.3': {'table': [[str(total[h])] for h in houses], 'rows': houses},
    '5.4': [sent[0][1].isoformat(), str(sent[0][0]), str(len(sent)), str(sum(s for *_, s in sent))],
    '5.5': [str(minimum)],
}))
