wiersze = [w.strip() for w in open("szachy.txt") if w.strip()]
plansze = [wiersze[i : i + 8] for i in range(0, len(wiersze), 8)]

puste = [sum(1 for c in range(8) if all(p[r][c] == "." for r in range(8))) for p in plansze]
z = [x for x in puste if x > 0]
print(len(z), max(z))
