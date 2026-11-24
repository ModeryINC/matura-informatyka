def bloki(napis):
    return 1 + sum(1 for a, b in zip(napis, napis[1:]) if a != b)


print(sum(1 for w in open("bin.txt") if w.strip() and bloki(w.strip()) <= 2))
