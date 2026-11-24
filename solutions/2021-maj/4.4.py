napis = []
for wiersz in open("instrukcje.txt"):
    polecenie, znak = wiersz.split()
    if polecenie == "DOPISZ":
        napis.append(znak)
    elif polecenie == "ZMIEN":
        napis[-1] = znak
    elif polecenie == "USUN":
        napis.pop()
    elif polecenie == "PRZESUN" and znak in napis:
        i = napis.index(znak)
        napis[i] = "A" if znak == "Z" else chr(ord(znak) + 1)
print("".join(napis))
