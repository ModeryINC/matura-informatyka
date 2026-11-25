def farey(n):
    ciag = [(0, 1), (1, 1)]
    zmiana = True
    while zmiana:
        zmiana = False
        nowy = [ciag[0]]
        for (a, b), (c, d) in zip(ciag, ciag[1:]):
            if b + d <= n:
                nowy.append((a + c, b + d))
                zmiana = True
            nowy.append((c, d))
        ciag = nowy
    return [[a, b] for a, b in ciag]
