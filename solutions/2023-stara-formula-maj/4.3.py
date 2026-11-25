WZOR = "wakacje"
wyniki = []
for wiersz in open("slowa.txt"):
    s = wiersz.strip()
    if s:
        dopasowane = 0
        for c in s:
            if c == WZOR[dopasowane % 7]:
                dopasowane += 1
        pelne = dopasowane // 7
        wyniki.append(len(s) - 7 * pelne)
print(*wyniki)
