def kolejnosc(ksiazki):
    polki = {}

    for numer in ksiazki:
        i, j = 0, 1
        while (i, j) in polki:
            if numer < polki[(i, j)]:
                i, j = i + 1, 2 * j - 1
            else:
                i, j = i + 1, 2 * j
        polki[(i, j)] = numer

    wynik = []

    def A(i, j):
        wynik.append(polki[(i, j)])
        if (i + 1, 2 * j - 1) in polki:
            A(i + 1, 2 * j - 1)
        if (i + 1, 2 * j) in polki:
            A(i + 1, 2 * j)

    A(0, 1)
    return wynik
