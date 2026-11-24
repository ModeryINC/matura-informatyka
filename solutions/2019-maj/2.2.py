def napisy(n, k):
    wynik = []

    def pisz(s):
        if len(s) == n:
            wynik.append(s)
        else:
            for i in range(k):
                pisz(s + str(i))

    pisz("")
    return wynik
