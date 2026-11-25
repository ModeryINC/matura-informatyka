print(sum(1 for w in open("slowa.txt") if w.split() and w.split()[0] in w.split()[1]))
