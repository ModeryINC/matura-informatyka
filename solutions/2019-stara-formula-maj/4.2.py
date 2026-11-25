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

obrot = lambda m: [r[::-1] for r in m[::-1]]
for i in range(len(mapy)):
    for j in range(i + 1, len(mapy)):
        if obrot(mapy[i]) == mapy[j]:
            print(i + 1, j + 1)
