from math import isqrt

liczby = [int(w) for w in open("liczby.txt") if w.strip()]
kwadraty = [n for n in liczby if isqrt(n) ** 2 == n]
print(len(kwadraty), kwadraty[0])
