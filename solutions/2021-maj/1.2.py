def dopelnienie(n):
    d = 0
    mnoznik = 1
    while n > 0:
        d += (9 - n % 10) * mnoznik
        mnoznik *= 10
        n //= 10
    return d
