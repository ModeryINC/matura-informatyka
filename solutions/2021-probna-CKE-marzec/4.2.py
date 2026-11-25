galerie = []
for wiersz in open("galerie.txt"):
    t = wiersz.split()
    if t:
        liczby = list(map(int, t[2:]))
        lokale = [(liczby[i], liczby[i + 1]) for i in range(0, len(liczby), 2) if liczby[i] > 0]
        galerie.append((t[0], t[1], lokale))

pow = [(miasto, sum(a * b for a, b in l), len(l)) for _, miasto, l in galerie]
for m, p, n in pow:
    print(m, p, n)
najw = max(pow, key=lambda x: x[1])
najm = min(pow, key=lambda x: x[1])
print(najw[0], najw[1])
print(najm[0], najm[1])
