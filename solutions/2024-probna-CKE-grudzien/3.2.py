def rozne_czynniki(n):
    ile, d = 0, 2
    while d * d <= n:
        if n % d == 0:
            ile += 1
            while n % d == 0:
                n //= d
        d += 1
    return ile + (1 if n > 1 else 0)


for wiersz in open("liczby.txt"):
    if wiersz.strip() and rozne_czynniki(int(wiersz)) >= 5:
        print(int(wiersz))
