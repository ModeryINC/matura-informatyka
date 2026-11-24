from math import gcd

licznik = 0
for wiersz in open("dron.txt"):
    a, b = map(int, wiersz.split())
    if gcd(abs(a), abs(b)) > 1:
        licznik += 1
print(licznik)
