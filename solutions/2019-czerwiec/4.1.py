def pierwsza(n):
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True


for wiersz in open("liczby.txt"):
    if wiersz.strip():
        n = int(wiersz)
        if 100 <= n <= 5000 and pierwsza(n):
            print(n)
