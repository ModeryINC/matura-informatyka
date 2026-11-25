def najwiekszy_czynnik(n):
    d = 2
    wynik = 1
    while d * d <= n:
        while n % d == 0:
            wynik = d
            n //= d
        d += 1
    if n > 1:
        wynik = n
    return wynik
