from collections import Counter

for wiersz in open("slowa.txt"):
    s = wiersz.strip()
    if s and 2 * max(Counter(s).values()) >= len(s):
        print(s)
