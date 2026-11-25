galerie = []
for wiersz in open("galerie.txt"):
    t = wiersz.split()
    if t:
        liczby = list(map(int, t[2:]))
        lokale = [(liczby[i], liczby[i + 1]) for i in range(0, len(liczby), 2) if liczby[i] > 0]
        galerie.append((t[0], t[1], lokale))

licznik = {}
for kraj, _, _ in galerie:
    licznik[kraj] = licznik.get(kraj, 0) + 1
for kraj, ile in licznik.items():
    print(kraj, ile)
