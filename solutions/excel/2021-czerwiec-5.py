# Zadanie 5. Wypożyczalnia (czerwiec 2021) – symulacja bez pliku danych.
import json
import math
from collections import defaultdict
from datetime import date, timedelta

START, END = date(2023, 1, 1), date(2024, 12, 31)


def season_share(day):
    md = (day.month, day.day)
    if md >= (12, 21) or md <= (3, 20):
        return 20
    if md <= (6, 20):
        return 50
    if md <= (9, 22):
        return 90
    return 40


def simulate(price=30, expand=False):
    bikes, cost, income = 10, 8000, 0
    monthly = defaultdict(int)
    monthly[(2023, 1)] -= 8000
    first_profit = None
    end_2023 = None
    day = START
    while day <= END:
        last_of_month = (day + timedelta(days=1)).month != day.month
        buy = expand and last_of_month and day != END and income - cost >= 2400
        if day.weekday() == 6:
            cost += 15 * bikes
            monthly[(day.year, day.month)] -= 15 * bikes
        elif day.weekday() < 5:
            earned = bikes * season_share(day) // 100 * price
            income += earned
            monthly[(day.year, day.month)] += earned
        if buy:
            cost += 2400
            bikes += 3
        if first_profit is None and cost < income:
            first_profit = day
        if day == date(2023, 12, 31):
            end_2023 = (cost, income)
        day += timedelta(days=1)
    return cost, income, monthly, first_profit, end_2023


cost, income, monthly, first_profit, end_2023 = simulate()
prices = [next(p for p in range(1, 1000) if (lambda r: r[1] - r[0])(simulate(p)) >= goal)
          for goal in (100000, 125000, 150000)]
e_cost, e_income, *_ = simulate(expand=True)

print(json.dumps({
    '5.1': [str(end_2023[0]), str(end_2023[1]), first_profit.isoformat()],
    '5.2': {'table': [[str(monthly[(2023, m)])] for m in range(1, 13)]},
    '5.3': [str(p) for p in prices],
    '5.4': [str(e_income), str(e_cost)],
}))
