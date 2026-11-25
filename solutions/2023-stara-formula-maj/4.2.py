from collections import Counter

WZOR = Counter("wakacje")
wyniki = []
for wiersz in open("slowa.txt"):
    s = wiersz.strip()
    if s:
        litery = Counter(s)
        wyniki.append(min(litery[c] // ile for c, ile in WZOR.items()))
print(*wyniki)
