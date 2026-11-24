CYFRY = {"o": 0, "+": 1, "*": 2}


def wartosc(napis):
    w = 0
    for znak in napis:
        w = w * 3 + CYFRY[znak]
    return w


napisy = [w.strip() for w in open("symbole.txt") if w.strip()]
najwiekszy = max(napisy, key=wartosc)
print(wartosc(najwiekszy), najwiekszy)
