# Zadanie 7. Staw (maj 2026) – wzorcowe obliczenia do klucza.
import json
from collections import defaultdict
from datetime import date, timedelta

rows = []
with open('staw.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            day, temp, rain = line.rstrip('\r\n').split('\t')
            rows.append((date.fromisoformat(day), float(temp.replace(',', '.')), int(rain)))

# 7.1 – średnie miesięczne temperatury
temps = defaultdict(list)
for day, temp, _ in rows:
    temps[day.month].append(temp)
table71 = [[f'{sum(temps[m]) / len(temps[m]):.1f}'] for m in range(1, 13)]

# 7.2 – najdłuższy ciąg dni bez opadów w każdym miesiącu (ciąg nie przechodzi na kolejny miesiąc)
longest = dict.fromkeys(range(1, 13), 0)
run, month = 0, 1
for day, _, rain in rows:
    if day.month != month:
        run, month = 0, day.month
    run = run + 1 if rain == 0 else 0
    longest[month] = max(longest[month], run)
table72 = [[str(longest[m])] for m in range(1, 13)]

# 7.3 i 7.4 – rzęsa wodna od 1.03.2023 przez 184 dni
AREA = 10_000
START = date(2023, 3, 1)
DAYS = 184


def simulate(fish):
    """Pomiary poranne (dzień 1 = 1 marca). Za dnia ryby zjadają rzęsę, w nocy rośnie."""
    cover = 2000.0
    mornings = []
    for n in range(DAYS):
        day = START + timedelta(days=n)
        mornings.append(cover)
        cover -= fish * 0.25 + (60 if day.weekday() == 4 else 0)
        cover = max(cover, 0) * 1.0175
    return mornings


mornings = simulate(80)
assert abs(mornings[(date(2023, 4, 30) - START).days] / AREA * 100 - 25.79) < 0.005
first_day = next(n + 1 for n, cover in enumerate(mornings) if cover > 0.75 * AREA)
fish = next(f for f in range(0, 1000) if max(simulate(f)) <= 0.5 * AREA)

print(
    json.dumps(
        {
            '7.1': {'table': table71},
            '7.2': {'table': table72},
            '7.3': [str(first_day), (START + timedelta(days=first_day - 1)).isoformat()],
            '7.4': [str(fish)],
        },
        ensure_ascii=False,
    )
)
