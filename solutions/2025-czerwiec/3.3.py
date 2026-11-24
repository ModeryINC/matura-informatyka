import re

tekst = open("dane.txt").read()
for liczba in re.findall(r"\d+", tekst):
    if len(liczba) == 9 and liczba[0] == "5":
        print(liczba)
