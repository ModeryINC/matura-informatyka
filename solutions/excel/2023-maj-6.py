# Zadanie 6. Konfitury owocowe (maj 2023) – wzorcowe obliczenia do klucza.
import json

MONTHS = ['maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień']

rows = []
with open('owoce.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        date, m, t, p = line.split('\t')
        rows.append((date, int(m), int(t), int(p)))

# 6.1 – zestawienie miesięczne
sums = {}
for date, *kg in rows:
    month = int(date.split('.')[1])
    sums.setdefault(month, [0, 0, 0])
    for i, value in enumerate(kg):
        sums[month][i] += value
table61 = [[str(v) for v in sums[month]] for month in sorted(sums)]

# 6.2 – dni, w których porzeczek było najwięcej
days = sum(1 for _, m, t, p in rows if p > m and p > t)

# 6.3 i 6.4 – produkcja konfitur
NAMES = ['malinowo-porzeczkowe', 'malinowo-truskawkowe', 'truskawkowo-porzeczkowe']
count = dict.fromkeys(NAMES, 0)
kg = dict.fromkeys(NAMES, 0)
stock = [0, 0, 0]  # maliny, truskawki, porzeczki
for _, m, t, p in rows:
    stock = [stock[0] + m, stock[1] + t, stock[2] + p]
    smallest = stock.index(min(stock))
    used = [i for i in range(3) if i != smallest]
    amount = min(stock[i] for i in used)
    name = {(0, 2): NAMES[0], (0, 1): NAMES[1], (1, 2): NAMES[2]}[tuple(used)]
    count[name] += 1
    kg[name] += amount
    for i in used:
        stock[i] -= amount

print(
    json.dumps(
        {
            '6.1': {'table': table61},
            '6.2': [str(days)],
            '6.3': {'table': [[str(count[n])] for n in NAMES]},
            '6.4': {'table': [[str(kg[n])] for n in NAMES]},
        },
        ensure_ascii=False,
    )
)
