for wiersz in open("slowa.txt"):
    s = wiersz.strip()
    for i in range(len(s) - 4):
        if s[i] == "e" and s[i + 4] == "e":
            print(s[i : i + 5])
