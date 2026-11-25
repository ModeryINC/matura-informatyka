galerie = []
for wiersz in open("galerie.txt"):
    t = wiersz.split()
    if t:
        liczby = list(map(int, t[2:]))
        lokale = [(liczby[i], liczby[i + 1]) for i in range(0, len(liczby), 2) if liczby[i] > 0]
        galerie.append((t[0], t[1], lokale))

rodzaje = [(miasto, len({a * b for a, b in l})) for _, miasto, l in galerie]
najw = max(rodzaje, key=lambda x: x[1])
najm = min(rodzaje, key=lambda x: x[1])
print(*najw)
print(*najm)
