# Zadanie 5. Hurtownia ogrodnicza (czerwiec 2023, stara formuła) – symulacja bez pliku danych.
import json
import math
from datetime import date, timedelta

START, END = date(2022, 4, 1), date(2022, 10, 31)


def simulate(apples=100, cherries=75):
    days = []  # (dzień, sprzedane jabłonie, sprzedane wiśnie, stan jabłoni rano)
    apple_deliveries = cherry_deliveries = monday_extra = waste = 0
    last_fri = last_sat = 0
    day = START
    while day <= END:
        wd = day.weekday()
        if wd == 6:
            days.append((day, 0, 0, apples))
            day += timedelta(days=1)
            continue
        if wd == 0:
            lost = math.ceil(apples * 0.05)
            waste += lost
            apples -= lost
            if last_fri + last_sat > 25:
                apples += 15
                apple_deliveries += 1
                monday_extra += 1
        if wd == 3:
            apples += 50
            cherries += 25
            apple_deliveries += 1
            cherry_deliveries += 1
        morning = apples
        sold_a = math.ceil(apples * 0.3)
        sold_c = math.ceil(cherries * 0.2)
        apples -= sold_a
        cherries -= sold_c
        if wd == 4:
            last_fri = sold_a
        if wd == 5:
            last_sat = sold_a
        days.append((day, sold_a, sold_c, morning))
        day += timedelta(days=1)
    return days, apple_deliveries, cherry_deliveries, monday_extra, waste


days, a_del, c_del, _, waste = simulate()
assert waste == 34, waste
first_low = next(d for d, _, c, _ in days if d.weekday() != 6 and c < 3)
bins = [sum(1 for _, a, _, _ in days if a < 10),
        sum(1 for _, a, _, _ in days if 10 <= a < 20),
        sum(1 for _, a, _, _ in days if a >= 20)]
ok = [s for s in range(0, 1000)
      if (r := simulate(apples=s))[3] == 0 and all(m > 0 for *_, m in r[0])]

print(json.dumps({
    '5.1': [str(a_del), str(c_del)],
    '5.3': [first_low.isoformat()],
    '5.4': {'table': [[str(b)] for b in bins]},
    '5.5': [str(max(ok))],
}))
