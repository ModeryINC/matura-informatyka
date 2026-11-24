with open("liczby.txt") as plik:
    pierwsze = list(map(int, plik.readline().split()))
    druga = list(map(int, plik.readline().split()))

print(sum(1 for p in pierwsze if any(x % p == 0 for x in druga)))
