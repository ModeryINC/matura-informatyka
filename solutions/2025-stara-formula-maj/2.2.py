def falista(n):
    jednosci = n % 10
    dziesiatki = n // 10 % 10
    dlugosc = 0
    while n > 0:
        dlugosc += 1
        n //= 10
    f = 0
    mnoznik = 1
    for i in range(dlugosc):
        f += (jednosci if i % 2 == 0 else dziesiatki) * mnoznik
        mnoznik *= 10
    return f
