zrownowazone = prawie = 0
for wiersz in open("anagram.txt"):
    s = wiersz.strip()
    if s:
        roznica = abs(s.count("1") - s.count("0"))
        if roznica == 0:
            zrownowazone += 1
        elif roznica == 1:
            prawie += 1
print(zrownowazone)
print(prawie)
