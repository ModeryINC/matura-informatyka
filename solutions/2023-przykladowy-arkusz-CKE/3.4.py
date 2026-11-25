from math import gcd

print(sum(1 for w in open("liczby.txt") if w.strip() and gcd(*map(int, w.split()[:2])) == 1))
