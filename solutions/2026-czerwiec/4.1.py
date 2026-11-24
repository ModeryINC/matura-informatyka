miasta = [list(map(int, w.split())) for w in open("mapa.txt") if w.strip()]
i = max(range(len(miasta)), key=lambda i: miasta[i][2])
print(i + 1, miasta[i][2])
