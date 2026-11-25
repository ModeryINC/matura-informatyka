import re

tekst = open("dane.txt").read()
numery = [s for s in re.findall(r"\d+", tekst) if len(s) == 9]
najmniej = min(len(set(s)) for s in numery)
for s in numery:
    if len(set(s)) == najmniej:
        print(s)
