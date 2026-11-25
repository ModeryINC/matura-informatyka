def potega(a, x, M):
    wynik = 1 % M
    a %= M
    while x > 0:
        if x % 2 == 1:
            wynik = wynik * a % M
        a = a * a % M
        x //= 2
    return wynik
