licznik = 0
for wiersz in open("dane.txt"):
    if wiersz.strip():
        b = bin(int(wiersz))[2:].rstrip("0")
        if b == b[::-1]:
            licznik += 1
print(licznik)
