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
        if pierwsza(n) and pierwsza(int(str(n)[::-1])):
            print(n)
