napis = []
for wiersz in open("instrukcje.txt"):
    polecenie, znak = wiersz.split()
    if polecenie == "DOPISZ":
        napis.append(znak)
    elif polecenie == "USUN":
        napis.pop()
print(len(napis))
