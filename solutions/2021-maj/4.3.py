from collections import Counter

licznik = Counter()
for wiersz in open("instrukcje.txt"):
    polecenie, znak = wiersz.split()
    if polecenie == "DOPISZ":
        licznik[znak] += 1
litera, ile = licznik.most_common(1)[0]
print(litera, ile)
