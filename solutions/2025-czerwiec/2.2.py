from math import gcd

licznik = 0
for wiersz in open("liczby1.txt"):
    s = wiersz.strip()
    if s:
        a, b = int(s[: len(s) // 2]), int(s[len(s) // 2 :])
        if gcd(a, b) == 1:
            licznik += 1
print(licznik)
