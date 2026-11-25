def przesun(tekst, klucz, kierunek):
    wynik = []
    for i, c in enumerate(tekst):
        d = int(klucz[i % len(klucz)]) * kierunek
        wynik.append(chr((ord(c) - 65 + d) % 26 + 65))
    return "".join(wynik)


with open("dane.txt") as plik:
    klucz = plik.readline().strip()
    n = int(plik.readline())
    wiersze = [plik.readline().split() for _ in range(n)]

wyjscie = [klucz, str(n)]
for rodzaj, lancuch in wiersze:
    if rodzaj == "0":
        wyjscie.append("1 " + przesun(lancuch, klucz, 1))
    else:
        wyjscie.append("0 " + przesun(lancuch, klucz, -1))
print(wyjscie[24])
