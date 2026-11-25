licznik = 0
for wiersz in open("symbole.txt"):
    s = wiersz.strip()
    if s:
        roznice = sum(1 for i in range(len(s) // 2) if s[i] != s[-1 - i])
        if roznice == 1:
            licznik += 1
print(licznik)
