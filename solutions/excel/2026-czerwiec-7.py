# Zadanie 7. Recykling (czerwiec 2026) – wzorcowe obliczenia do klucza.
import json
from collections import Counter, defaultdict
from datetime import datetime

rows = []
with open('dostawy.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            _, day, who, kg = line.rstrip('\r\n').split('\t')
            rows.append((datetime.strptime(day, '%d.%m.%Y').date(), who, int(kg)))

daily = defaultdict(int)
for day, _, kg in rows:
    daily[day] += kg
best_day = max(daily, key=daily.get)

pairs = Counter((day, who) for day, who, _ in rows)
twice = sum(1 for n in pairs.values() if n == 2)

monthly = defaultdict(int)
for day, _, kg in rows:
    monthly[day.month] += kg


def simulate(capacity):
    stock = 5000
    history = []  # (dzień, przetworzono, stan na koniec dnia)
    for day in sorted(daily):
        done = min(stock, capacity)
        stock = stock - done + daily[day]
        history.append((day, done, stock))
    return history


history = simulate(3900)
peak = max(history, key=lambda h: h[2])
less = sum(1 for _, done, _ in history if done < 3900)
full = max(c for c in range(1, 3901) if all(done == c for _, done, _ in simulate(c)))

print(json.dumps({
    '7.1': [best_day.isoformat(), str(daily[best_day])],
    '7.2': [str(twice)],
    '7.3': {'table': [[str(monthly[m])] for m in range(1, 13)]},
    '7.4': [str(peak[2]), peak[0].isoformat()],
    '7.5': [str(full)],
    'mniej-niz-3900': [str(less)],
}))
