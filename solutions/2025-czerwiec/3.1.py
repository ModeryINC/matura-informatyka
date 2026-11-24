import re

tekst = open("dane.txt").read()
print(sum(1 for liczba in re.findall(r"\d+", tekst) if liczba.startswith("50")))
