# Zadanie 5. Telefony (próbna CKE, marzec 2021) – wzorcowe obliczenia do klucza.
import json
import math
from collections import Counter, defaultdict
from datetime import datetime


def seconds(text):
    h, m, s = (int(x) for x in text.split(':'))
    return h * 3600 + m * 60 + s


def kind(nr):
    return 'stacjonarny' if len(nr) == 7 else 'komórkowy' if len(nr) == 8 else 'zagraniczny'


calls = []
with open('telefony.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            nr, day, start, end = line.split()
            calls.append((datetime.strptime(day, '%d-%m-%Y').date(), seconds(start), nr,
                          seconds(end) - seconds(start)))
calls.sort()

top = Counter(nr for _, _, nr, _ in calls).most_common(3)

per_day = defaultdict(Counter)
for day, _, nr, _ in calls:
    per_day[day][kind(nr)] += 1
days = sorted(per_day)

twelve = [d for _, _, nr, d in calls if kind(nr) == 'stacjonarny' and nr.startswith('12')]

# Rachunek: pierwsze 800 minut rozmów krajowych (w kolejności połączeń) w abonamencie.
free = 800 * 60
rest = Counter()
foreign = 0
for _, _, nr, d in calls:
    k = kind(nr)
    if k == 'zagraniczny':
        foreign += math.ceil(d / 60)
        continue
    used = min(free, d)
    free -= used
    rest[k] += d - used
fixed = math.ceil(rest['stacjonarny'] / 6000) * 5
mobile = math.ceil(rest['komórkowy'] / 6000) * 6

print(json.dumps({
    '5.1': {'table': [[nr, str(n)] for nr, n in top]},
    '5.2': {'table': [[str(per_day[d]['komórkowy']), str(per_day[d]['stacjonarny'])] for d in days],
            'rows': [d.isoformat() for d in days]},
    '5.3': [str(len(twelve)), str(math.ceil(sum(twelve) / 60))],
    '5.4': [str(50), str(fixed), str(mobile), str(foreign), str(50 + fixed + mobile + foreign)],
}))
