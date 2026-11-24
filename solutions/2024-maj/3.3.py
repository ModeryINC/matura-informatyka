from math import gcd


def skrot(n):
    return int("".join(c for c in str(n) if int(c) % 2 == 1))


for wiersz in open("skrot2.txt"):
    n = int(wiersz)
    if gcd(n, skrot(n)) == 7:
        print(n)
