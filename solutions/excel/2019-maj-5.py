# Zadanie 5. Chmury (maj 2019) – wzorcowe obliczenia do klucza.
import json
from collections import Counter, defaultdict

rows = []
with open('pogoda.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            day, temp, rain, cat, size = line.strip().split(';')
            rows.append((int(day), float(temp.replace(',', '.')), int(rain), cat, int(size)))

warm_dry = sum(1 for _, t, r, _, _ in rows if t >= 20 and r <= 5)

best, run = (0, 0), 0
for i in range(1, len(rows)):
    run = run + 1 if rows[i][1] > rows[i - 1][1] else 0
    if run > best[0]:
        best = (run, i - run)
# Pierwszy dzień ciągu to pierwszy dzień cieplejszy od poprzedniego (jak w przykładzie: 36).
first_day, last_day = rows[best[1] + 1][0], rows[best[1] + best[0]][0]

rain_by_kind = defaultdict(list)
for _, _, r, cat, size in rows[:300]:
    if size > 0:
        rain_by_kind[f'{cat}{size}'].append(r)
kinds = [f'{c}{n}' for c in 'CS' for n in range(1, 6)]

# Teoria prof. Nubisa: dzień 1 bezchmurny.
model = []  # (kategoria, wielkość)
cat, size, age = '0', 0, 0
for i, (_, t, r, _, _) in enumerate(rows):
    if i > 0:
        prev_size, prev_rain = model[-1][1], rows[i - 1][2]
        if prev_size == 0:
            cat, size, age = ('C' if t >= 10 else 'S'), 1, 1
        elif prev_size == 5:
            if prev_rain >= 20:
                cat, size, age = '0', 0, 0
        elif age == 3:
            size, age = size + 1, 1
        else:
            age += 1
    model.append((cat, size))
assert all(m == (o[3], o[4]) for m, o in zip(model[:20], rows[:20]))
sizes = Counter(s for _, s in model)
size_ok = sum(1 for m, o in zip(model[:300], rows[:300]) if m[1] == o[4])
cat_ok = sum(1 for m, o in zip(model[:300], rows[:300]) if m[0] == o[3])

print(json.dumps({
    '5.1': [str(warm_dry)],
    '5.2': [str(first_day), str(last_day)],
    '5.3': {'table': [[f'{sum(rain_by_kind[k]) / len(rain_by_kind[k]):.2f}'] for k in kinds]},
    '5.4': {'fields': [str(size_ok), str(cat_ok)], 'table': [[str(sizes[s])] for s in range(6)]},
}))
