pary = [w.split() for w in open("slowa.txt") if w.strip()]
anagramy = [(a, b) for a, b in pary if sorted(a) == sorted(b)]
print(len(anagramy))
for a, b in anagramy:
    print(a, b)
