# Zadanie 6. Statek (czerwiec 2020) – wzorcowe obliczenia do klucza.
import json
from collections import Counter, defaultdict
from datetime import date

rows = []
with open('statek.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            day, port, item, kind, tons, price = line.rstrip('\r\n').split('\t')
            rows.append((date.fromisoformat(day), port, item, kind, int(tons), int(price)))

loads = Counter(item for _, _, item, kind, _, _ in rows if kind == 'Z')
top_item = loads.most_common(1)[0][0]
top_tons = sum(t for _, _, item, kind, t, _ in rows if kind == 'Z' and item == top_item)

visits = sorted({d for d, *_ in rows})
long_trips = sum(1 for a, b in zip(visits, visits[1:]) if (b - a).days - 1 > 20)


def cargo(on_day):
    stock = defaultdict(int)
    for d, _, item, kind, t, _ in rows:
        if d < on_day:
            stock[item] += t if kind == 'Z' else -t
    present = {k: v for k, v in stock.items() if v > 0}
    hi = max(present, key=present.get)
    lo = min(present, key=present.get)
    return [hi, str(present[hi]), lo, str(present[lo])]


t5 = defaultdict(lambda: [0, 0])
for d, _, item, kind, t, _ in rows:
    if item == 'T5':
        t5[f'{d.year}-{d.month:02d}'][0 if kind == 'Z' else 1] += t
months = [f'{y}-{m:02d}' for y in (2016, 2017, 2018) for m in range(1, 13)]

cash, best, running, lowest = 500000, None, 0, 0
for i, (d, _, _, kind, t, price) in enumerate(rows):
    change = -t * price if kind == 'Z' else t * price
    cash += change
    running += change
    lowest = min(lowest, running)
    if i + 1 == len(rows) or rows[i + 1][0] != d:  # koniec dnia (po wypłynięciu)
        if best is None or cash > best[1]:
            best = (d, cash)

print(json.dumps({
    '6.1': [top_item, str(top_tons)],
    '6.2': [str(long_trips)],
    '6.3': cargo(date(2016, 2, 1)) + cargo(date(2018, 8, 1)),
    '6.4': {'table': [[str(t5[m][0]), str(t5[m][1])] for m in months], 'rows': months},
    '6.5': [str(cash), best[0].isoformat(), str(best[1]), str(-lowest)],
}))
