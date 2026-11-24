haslo = ""
for wiersz in open("napisy.txt"):
    cyfry = [c for c in wiersz.strip() if c.isdigit()]
    for i in range(0, len(cyfry) - 1, 2):
        kod = int(cyfry[i] + cyfry[i + 1])
        if 65 <= kod <= 90:
            haslo += chr(kod)
            if haslo.endswith("XXX"):
                break
    if haslo.endswith("XXX"):
        break
print(haslo)
