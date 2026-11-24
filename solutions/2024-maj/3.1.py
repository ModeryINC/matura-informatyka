def skrot(n):
    wynik = 0
    mnoznik = 1
    while n > 0:
        cyfra = n % 10
        n //= 10
        if cyfra % 2 == 1:
            wynik += cyfra * mnoznik
            mnoznik *= 10
    return wynik
