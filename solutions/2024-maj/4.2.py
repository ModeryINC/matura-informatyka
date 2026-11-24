with open("liczby.txt") as plik:
    pierwsze = list(map(int, plik.readline().split()))

print(sorted(pierwsze, reverse=True)[100])
