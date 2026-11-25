# Zadanie 5. Staw (maj 2026, stara formuła) – dane jak 2026-maj-7, dodatkowy podpunkt 5.3.
import json
import runpy
from pathlib import Path

r = runpy.run_path(str(Path(__file__).with_name('_alias.py')))['results']('2026-maj-7')

# 5.3 – tempo rozrostu: opady > 5 mm – brak; 10 ≤ t < 18 → 1%, 18 ≤ t < 28 → 2%.
one = two = 0
with open('staw.txt', encoding='utf-8') as f:
    next(f)
    for line in f:
        if line.strip():
            _, temp, rain = line.rstrip('\r\n').split('\t')
            t, o = float(temp.replace(',', '.')), int(rain)
            if o <= 5 and 10 <= t < 18:
                one += 1
            elif o <= 5 and 18 <= t < 28:
                two += 1

print(json.dumps({
    '5.1': r['7.1'], '5.2': r['7.2'], '5.3': [str(one), str(two)], '5.4': r['7.3'][:1], '5.5': r['7.4'],
}))
