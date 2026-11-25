def potega(a, b):
    wynik = 1
    while b > 0:
        if b % 2 == 1:
            wynik *= a
        a *= a
        b //= 2
    return wynik
