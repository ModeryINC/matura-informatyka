def wczytaj():
    mapy, biezaca = [], []
    for wiersz in open("dzialki.txt"):
        wiersz = wiersz.strip()
        if wiersz:
            biezaca.append(wiersz)
            if len(biezaca) == 30:
                mapy.append(biezaca)
                biezaca = []
    return mapy


mapy = wczytaj()


def bok(m):
    b = 0
    while b < 30 and all(m[r][c] != "X" for r in range(b + 1) for c in range(b + 1)):
        b += 1
    return b


boki = [bok(m) for m in mapy]
najw = max(boki)
for i, b in enumerate(boki):
    if b == najw:
        print(i + 1, b)
