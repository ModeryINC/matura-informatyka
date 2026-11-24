from collections import Counter

licznik = Counter(int(w) for w in open("liczby.txt") if w.strip())
krotnosci = Counter(licznik.values())
print(len(licznik), krotnosci[2], krotnosci[3])
