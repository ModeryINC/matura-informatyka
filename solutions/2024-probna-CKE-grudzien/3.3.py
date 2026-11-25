mniejsze = wieksze = 0
rowne = []
for wiersz in open("liczby.txt"):
    if wiersz.strip():
        s = wiersz.strip()
        r = int("".join(sorted(s, reverse=True))) - int("".join(sorted(s)))
        n = int(s)
        if r < n:
            mniejsze += 1
        elif r > n:
            wieksze += 1
        else:
            rowne.append(n)
print(mniejsze, wieksze, len(rowne))
for n in rowne:
    print(n)
