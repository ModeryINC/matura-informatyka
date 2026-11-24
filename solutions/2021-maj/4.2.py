polecenia = [w.split()[0] for w in open("instrukcje.txt") if w.strip()]
najlepszy = ("", 0)
dlugosc = 0
for i, p in enumerate(polecenia):
    dlugosc = dlugosc + 1 if i > 0 and polecenia[i - 1] == p else 1
    if dlugosc > najlepszy[1]:
        najlepszy = (p, dlugosc)
print(*najlepszy)
