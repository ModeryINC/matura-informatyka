print(sum(c.isdigit() for w in open("napisy.txt") for c in w.strip()))
