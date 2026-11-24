from math import factorial

for wiersz in open("liczby.txt"):
    if wiersz.strip():
        n = int(wiersz)
        if n == sum(factorial(int(c)) for c in str(n)):
            print(n)
