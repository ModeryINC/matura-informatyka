def przestaw2(n):
    wynik = 0
    mnoznik = 1
    while True:
        r = n % 100
        a = r // 10
        b = r % 10
        n = n // 100
        if n > 0:
            wynik += (a + 10 * b) * mnoznik
            mnoznik *= 100
        else:
            if a > 0:
                wynik += (a + 10 * b) * mnoznik
            else:
                wynik += b * mnoznik
            return wynik
