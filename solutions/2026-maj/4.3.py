from collections import Counter

szefowie = [int(w) for w in open("korpo.txt")]
licznik = Counter(szefowie[1:])
numer, ile = max(licznik.items(), key=lambda p: (p[1], -p[0]))
print(numer, ile)
