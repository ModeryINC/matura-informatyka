from collections import Counter

with open("liczby.txt") as plik:
    pierwsze = Counter(map(int, plik.readline().split()))
    druga = list(map(int, plik.readline().split()))

wynik = []
for x in druga:
    reszta = x
    for p in sorted(pierwsze):
        uzyte = 0
        while reszta % p == 0 and uzyte < pierwsze[p]:
            reszta //= p
            uzyte += 1
    if reszta == 1:
        wynik.append(x)
print(*wynik)
