WAGI = [7, 3, 1, 7, 3, 1, 7, 3]
for wiersz in open("identyfikator.txt"):
    s = wiersz.strip()
    if s:
        wartosci = [ord(c) - 55 for c in s[:3]] + [int(c) for c in s[4:]]
        if sum(w * x for w, x in zip(WAGI, wartosci)) % 10 != int(s[3]):
            print(s)
