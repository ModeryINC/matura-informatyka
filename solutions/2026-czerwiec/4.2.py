miasta = [list(map(int, w.split())) for w in open("mapa.txt") if w.strip()]
n = len(miasta)
odleglosci = {}
for i in range(n):
    for j in range(i + 1, n):
        d = abs(miasta[i][0] - miasta[j][0]) + abs(miasta[i][1] - miasta[j][1])
        odleglosci.setdefault(d, []).append((i + 1, j + 1))
najmniejsza = min(odleglosci)
print(najmniejsza)
for a, b in odleglosci[najmniejsza]:
    print(a, b)
