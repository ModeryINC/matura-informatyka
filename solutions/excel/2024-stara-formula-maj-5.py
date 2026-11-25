# Zadanie 5. Hurtownia (maj 2024, stara formuła) – dane jak 2024-maj-7, dodatkowy podpunkt 5.1.
import json
import runpy
from collections import defaultdict
from pathlib import Path

r = runpy.run_path(str(Path(__file__).with_name('_alias.py')))['results']('2024-maj-7')

daily = defaultdict(int)
with open('jablka.txt', encoding='utf-8') as f:
    for line in f:
        if line.strip():
            day, *_, kg = line.rstrip('\r\n').split('\t')
            daily[day] += int(kg)
days = sorted(daily)
best = (0, 0)  # (długość, indeks początku)
start = 0
for i in range(1, len(days) + 1):
    if i == len(days) or daily[days[i]] <= daily[days[i - 1]]:
        if i - start > best[0]:
            best = (i - start, start)
        start = i
first, last = days[best[1]], days[best[1] + best[0] - 1]

print(json.dumps({
    '5.1': [first, str(daily[first]), last, str(daily[last])],
    '5.2': r['7.1'], '5.3': r['7.2'], '5.4': r['7.3'], '5.5': r['7.4'],
}))
