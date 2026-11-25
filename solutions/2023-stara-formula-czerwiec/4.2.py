from math import comb

liczby = [w.strip() for w in open("anagram.txt") if len(w.strip()) == 8]


def anagramy(s):
    # pierwsza cyfra to 1; pozostałe 7 pozycji: rozmieszczenie zer
    zera = s.count("0")
    return comb(7, zera)


najwiecej = max(anagramy(s) for s in liczby)
for s in liczby:
    if anagramy(s) == najwiecej:
        print(s)
