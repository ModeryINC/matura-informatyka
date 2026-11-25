# Zadanie 4. Inwestycja w akcje (maj 2018, stara formuła) – wzorcowe obliczenia do klucza.
import json
import math

rows = []
with open('gielda.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            rows.append([float(x.replace(',', '.')) for x in line.split()])
names = ['A', 'B', 'C']

runs = []
for c in range(3):
    best = run = 1
    for i in range(1, len(rows)):
        run = run + 1 if rows[i][c] > rows[i - 1][c] else 1
        best = max(best, run)
    runs.append(best)
best_firm = max(range(3), key=lambda c: runs[c])

hossa_days = []
for i in range(1, len(rows)):
    count = sum(1 for c in range(3) if rows[i][c] > max(r[c] for r in rows[:i]))
    if count >= 2:
        hossa_days.append(i + 1)

price = [None] + [r[2] for r in rows]  # numeracja dni od 1
cash, shares, most, buys, day100 = 5000.0, 0, 0, 0, None


def buy(d):
    global cash, shares, buys
    if cash < 1000:
        return
    n = math.floor(1000 / price[d] + 1e-9)
    if n:
        cash -= n * price[d]
        shares += n
        buys += 1


for d in range(1, len(price)):
    if d >= 3 and price[d - 1] > max(price[1:d - 1]) and shares:
        cash += shares * price[d]
        shares = 0
    if d == 1 or (d >= 4 and price[d - 3] > price[d - 2] > price[d - 1]):
        buy(d)
    most = max(most, shares)
    if d == 100:
        day100 = (shares, round(cash, 2))
assert day100 == (0, 5834.75), day100

print(json.dumps({
    '4.2': [names[best_firm], str(runs[best_firm])],
    '4.3': {'table': [[str(d)] for d in hossa_days]},
    '4.4': [str(most), str(buys), str(shares), f'{cash:.2f}'],
}))
