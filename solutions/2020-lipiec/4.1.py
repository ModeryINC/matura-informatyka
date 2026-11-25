ids = [w.strip() for w in open("identyfikator.txt") if w.strip()]
suma = lambda s: sum(int(c) for c in s[3:])
najw = max(map(suma, ids))
for s in ids:
    if suma(s) == najw:
        print(s)
