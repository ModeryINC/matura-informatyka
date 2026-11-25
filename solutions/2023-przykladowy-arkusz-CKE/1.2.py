wiersze = [w.strip() for w in open("szachy.txt") if w.strip()]
plansze = [wiersze[i : i + 8] for i in range(0, len(wiersze), 8)]

from collections import Counter

rownowaga = []
for p in plansze:
    znaki = "".join(p)
    biale = Counter(c for c in znaki if c.isupper())
    czarne = Counter(c.upper() for c in znaki if c.islower())
    if biale == czarne:
        rownowaga.append(sum(biale.values()) * 2)
print(len(rownowaga), min(rownowaga))
