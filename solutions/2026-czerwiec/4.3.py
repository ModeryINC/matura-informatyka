miasta = [list(map(int, w.split())) for w in open("mapa.txt") if w.strip()]
najlepszy = None
for bok in range(1, 252):
    suma = sum(m for x, y, m in miasta if 0 < x < bok and 0 < y < bok)
    if suma > 2 * bok * bok:
        najlepszy = (bok, suma)
print(*najlepszy)
