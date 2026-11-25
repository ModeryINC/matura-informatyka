for wiersz in open("identyfikator.txt"):
    s = wiersz.strip()
    if s and (s[:3] == s[:3][::-1] or s[3:] == s[3:][::-1]):
        print(s)
