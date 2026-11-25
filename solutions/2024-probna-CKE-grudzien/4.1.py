prost = [tuple(map(int, w.split())) for w in open("prostokaty.txt") if w.strip()]

pola = [h * s for h, s in prost]
print(min(pola), max(pola))
