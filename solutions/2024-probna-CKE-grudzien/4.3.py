prost = [tuple(map(int, w.split())) for w in open("prostokaty.txt") if w.strip()]

from collections import defaultdict

szer = defaultdict(list)
for h, s in prost:
    szer[h].append(s)
wyniki = []
for k in (2, 3, 5):
    wyniki.append(max(sum(sorted(l, reverse=True)[:k]) for l in szer.values() if len(l) >= k))
print(*wyniki)
