# Zadanie 7. Energia odnawialna (próbna CKE, grudzień 2024) – wzorcowe obliczenia do klucza.
import json
import math
from collections import defaultdict


def read(name):
    with open(name, encoding='utf-8') as f:
        next(f)
        return [line.rstrip('\r\n').split('\t') for line in f if line.strip()]


num = lambda s: float(s.replace(',', '.'))  # noqa: E731
energy = [(d, int(h), num(w), num(p)) for d, h, w, p in read('energia.txt')]
demand = [num(z) for _, _, z in read('zapotrzebowanie.txt')]

wind, solar = defaultdict(float), defaultdict(float)
for d, _, w, p in energy:
    wind[d] += w
    solar[d] += p

by_hour = defaultdict(list)
for _, h, _, p in energy:
    by_hour[h].append(p)

best, run = (0, 0), 0
for i in range(1, len(energy)):
    run = run + 1 if energy[i][2] > energy[i - 1][2] else 0
    if run > best[0]:
        best = (run, i - run)
start, end = energy[best[1]], energy[best[1] + best[0]]


# Klucz CKE: najmniejszy stan początkowy, przy którym magazyn nigdy nie spada poniżej zera
# (pojemność 200 000 MWh przy tych danych nie ogranicza wyniku w ujęciu klucza).
store = lowest = 0.0
for (_, _, w, p), need in zip(energy, demand):
    store += w + p - need
    lowest = min(lowest, store)
low = math.ceil(-lowest - 1e-9)

print(json.dumps({
    '7.1': [max(wind, key=wind.get), max(solar, key=solar.get)],
    '7.2': {'table': [[f'{sum(by_hour[h]) / len(by_hour[h]):.2f}'] for h in range(1, 25)]},
    '7.3': [start[0], str(start[1]), end[0], str(end[1])],
    '7.4': [str(low)],
}))
