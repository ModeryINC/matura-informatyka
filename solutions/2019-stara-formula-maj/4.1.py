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

print(sum(1 for m in mapy if sum(r.count("*") for r in m) >= 0.7 * 900))
