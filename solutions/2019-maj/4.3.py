from math import gcd

liczby = [int(w) for w in open("liczby.txt") if w.strip()]
najlepszy = (0, 0, 0)  # (długość, pierwsza, nwd)
for i in range(len(liczby)):
    d = liczby[i]
    for j in range(i + 1, len(liczby)):
        d = gcd(d, liczby[j])
        if d == 1:
            break
        if j - i + 1 > najlepszy[0]:
            najlepszy = (j - i + 1, liczby[i], d)
dlugosc, pierwsza, nwd = najlepszy
print(pierwsza, dlugosc, nwd)
