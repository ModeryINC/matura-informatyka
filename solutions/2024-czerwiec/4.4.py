from collections import Counter

odbiorcy = [int(w) for w in open("odbiorcy.txt") if w.strip()]
n = len(odbiorcy)
polozenie = list(range(1, n + 1))
wyniki = []
for runda in range(1, 9):
    polozenie = [odbiorcy[k - 1] for k in polozenie]
    if runda in (1, 2, 4, 8):
        wyniki.append(max(Counter(polozenie).values()))
print(*wyniki)
