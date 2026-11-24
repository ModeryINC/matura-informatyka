liczby = [w.strip() for w in open("liczby.txt") if w.strip()]
pasujace = [s for s in liczby if s[0] == s[-1]]
print(len(pasujace), pasujace[0])
