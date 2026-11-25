def J(n):
    wynik = []
    pozycja = 1
    while n > 0:
        if n % 2 == 1:
            wynik.append(pozycja)
        n //= 2
        pozycja += 1
    return wynik
