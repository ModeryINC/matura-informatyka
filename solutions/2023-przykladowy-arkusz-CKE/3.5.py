licznik = 0
for wiersz in open("liczby.txt"):
    if wiersz.strip():
        M, a, b = map(int, wiersz.split())
        wartosc = 1 % M
        for x in range(M):
            if wartosc == b:
                licznik += 1
                break
            wartosc = wartosc * a % M
print(licznik)
