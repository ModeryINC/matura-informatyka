liczby = [w.strip() for w in open("bin.txt") if w.strip()]
print(max(liczby, key=lambda s: int(s, 2)))
