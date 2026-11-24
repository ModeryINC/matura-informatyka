pary = []
for wiersz in open("pary.txt"):
    liczba, slowo = wiersz.split()
    if int(liczba) == len(slowo):
        pary.append((int(liczba), slowo))
print(*min(pary))
