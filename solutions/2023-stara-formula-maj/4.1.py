for wiersz in open("slowa.txt"):
    s = wiersz.strip()
    if s and s.count("w") == s.count("k"):
        print(s)
