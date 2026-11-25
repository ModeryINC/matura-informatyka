# Zadanie 7. Hurtownia (maj 2024) – wzorcowe obliczenia do klucza.
import json
from collections import defaultdict

price = {}
with open('cennik.txt', encoding='utf-8') as f:
    for line in f:
        if line.strip():
            name, value = line.rstrip('\r\n').split('\t')
            price[name] = float(value.replace(',', '.'))

rows = []
with open('jablka.txt', encoding='utf-8') as f:
    for line in f:
        if line.strip():
            date, variety, code, nip, kg = line.rstrip('\r\n').split('\t')
            rows.append((date, variety, code, nip, int(kg)))

# 7.1 – trzech klientów kupujących najwięcej odmian zimowych
winter = defaultdict(int)
for _, _, code, nip, kg in rows:
    if code == 'Z':
        winter[nip] += kg
top = sorted(winter.items(), key=lambda item: -item[1])[:3]

# 7.2 – przychód
income = defaultdict(float)
for _, variety, _, _, kg in rows:
    income[variety] += price[variety] * kg
total = sum(income.values())
best = max(income, key=income.get)

# 7.3 – najpopularniejsza odmiana w każdym miesiącu
monthly = defaultdict(lambda: defaultdict(int))
for date, variety, _, _, kg in rows:
    monthly[int(date[5:7])][variety] += kg
table73 = []
for month in range(1, 13):
    variety, kg = max(monthly[month].items(), key=lambda item: item[1])
    table73.append([variety, str(kg)])

# 7.4 – rabaty
bought = defaultdict(int)
discounts = 0
value = 0
for _, _, _, nip, kg in rows:
    bought[nip] += kg
    if bought[nip] >= 20000:
        rate = 10
    elif bought[nip] >= 15000:
        rate = 5
    else:
        continue
    discounts += 1
    value += rate * kg  # w groszach

print(
    json.dumps(
        {
            '7.1': {'table': [[nip, str(kg)] for nip, kg in top]},
            '7.2': [f'{total:.2f}', best],
            '7.3': {'table': table73},
            '7.4': [str(discounts), f'{value / 100:.2f}'],
        },
        ensure_ascii=False,
    )
)
