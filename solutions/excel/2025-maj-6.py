# Zadanie 6. Martianeum (maj 2025) – wzorcowe obliczenia do klucza.
import json
from collections import defaultdict
from datetime import date

rows = []
with open('martianeum.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            day, area, mass, content = line.rstrip('\r\n').split('\t')
            rows.append(
                (
                    date.fromisoformat(day),
                    area,
                    float(mass.replace(',', '.')),
                    float(content.replace(',', '.')),
                )
            )

# 6.1 – łączna masa ładunków i wydobytego martianeum
total_mass = sum(r[2] for r in rows)
mined = sum(r[2] * r[3] / 100 for r in rows if r[3] >= 1)

# 6.2 – obszar o najmniejszej średniej masie ładunku
masses = defaultdict(list)
for _, area, mass, _ in rows:
    masses[area].append(mass)
lightest = min(masses, key=lambda a: sum(masses[a]) / len(masses[a]))

# 6.3 – 7-dniowe okresy od 3.03.2033
start = date(2033, 3, 3)
weeks = defaultdict(float)
for day, _, mass, _ in rows:
    weeks[(day - start).days // 7] += mass
best_week = max(weeks, key=weeks.get)
best_start = date.fromordinal(start.toordinal() + 7 * best_week)

# 6.4 – liczba przewozów z każdego obszaru w kolejnych latach
years = sorted({r[0].year for r in rows})
counts = defaultdict(lambda: defaultdict(int))
for day, area, _, _ in rows:
    counts[area][day.year] += 1
areas = sorted(counts)
table64 = [[str(counts[a][y]) for y in years] for a in areas]

# 6.5 – transporty na orbitę
stock = 0.0
transports = []
for day, _, mass, content in rows:
    if content >= 1:
        stock += mass * content / 100
    if stock >= 100:
        stock -= 100
        transports.append(day)

print(
    json.dumps(
        {
            '6.1': [f'{total_mass:.1f}', f'{mined:.4f}'],
            '6.2': [lightest],
            '6.3': [f'{weeks[best_week]:.1f}', best_start.isoformat()],
            '6.4': {'table': table64, 'rows': areas, 'columns': [str(y) for y in years]},
            '6.5': [str(len(transports)), transports[0].isoformat(), transports[-1].isoformat()],
        },
        ensure_ascii=False,
    )
)
