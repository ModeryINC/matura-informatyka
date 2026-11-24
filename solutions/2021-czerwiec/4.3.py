haslo = ""
for wiersz in open("napisy.txt"):
    s = wiersz.strip()
    for p in (s + s[0], s[-1] + s):
        if p == p[::-1]:
            haslo += p[len(p) // 2]
            break
print(haslo)
