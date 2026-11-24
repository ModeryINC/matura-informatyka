def pierwsza(n):
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True


for wiersz in open("pary.txt"):
    liczba = int(wiersz.split()[0])
    if liczba % 2 == 0:
        for p in range(2, liczba // 2 + 1):
            if pierwsza(p) and pierwsza(liczba - p):
                print(liczba, p, liczba - p)
                break
