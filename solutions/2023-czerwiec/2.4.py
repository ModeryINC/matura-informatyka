for wiersz in open("slowa4.txt"):
    if wiersz.strip():
        n, s = wiersz.split()
        print(min(s[k:] for k in range(len(s))))
