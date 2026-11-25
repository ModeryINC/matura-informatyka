# Zadanie 5. Wodociągi (maj 2021) – wzorcowe obliczenia do klucza.
import json
import math
from collections import defaultdict

MONTHS = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień',
          'wrzesień', 'październik', 'listopad', 'grudzień']

clients = []
with open('wodociagi.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            code, *usage = line.strip().split(';')
            clients.append((code[:5], int(code[5:7]), code[7:], [int(u) for u in usage]))

per_person = sorted(((sum(u) / n, nr) for nr, n, _, u in clients), reverse=True)[:10]

district_year = defaultdict(int)
district_month = defaultdict(lambda: [0] * 12)
for _, _, d, u in clients:
    district_year[d] += sum(u)
    for i, v in enumerate(u):
        district_month[d][i] += v
districts = sorted(district_year)

base = [sum(c[3][i] for c in clients) for i in range(12)]
forecast = {2019: base}
for year in range(2020, 2041):
    forecast[year] = [math.ceil(v * 1.01 - 1e-9) for v in forecast[year - 1]]


def first_shortage(capacity):
    for year in range(2020, 2041):
        for m in range(12):
            if forecast[year][m] > capacity(year):
                return f'{MONTHS[m]} {year}'


print(json.dumps({
    '5.1': {'table': [[nr, f'{avg:.2f}'] for avg, nr in per_person]},
    '5.2': {'table': [[str(district_year[d])] for d in districts], 'rows': districts},
    '5.3': {'table': [[str(max(district_month[d]))] for d in districts], 'rows': districts},
    '5.4': {
        'fields': [first_shortage(lambda y: 160000)],
        'table': [[str(v) for v in forecast[y]] for y in range(2020, 2031)],
    },
    '5.5': [first_shortage(lambda y: 160000 + 1000 * max(0, y - 2020))],
}))
