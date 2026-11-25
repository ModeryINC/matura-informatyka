print(sum(1 for w in open("slowa.txt") for s in w.split() if s.endswith("A")))
