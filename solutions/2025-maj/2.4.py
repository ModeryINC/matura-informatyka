CYFRY = {"o": 0, "+": 1, "*": 2}
ZNAKI = "o+*"


def wartosc(napis):
    w = 0
    for znak in napis:
        w = w * 3 + CYFRY[znak]
    return w


def na_symbole(n):
    if n == 0:
        return "o"
    wynik = ""
    while n > 0:
        wynik = ZNAKI[n % 3] + wynik
        n //= 3
    return wynik


suma = sum(wartosc(w.strip()) for w in open("symbole.txt") if w.strip())
print(suma, na_symbole(suma))
