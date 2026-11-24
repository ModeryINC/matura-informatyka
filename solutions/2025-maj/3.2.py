punkty = []
x = y = 0
for wiersz in open("dron.txt"):
    dx, dy = map(int, wiersz.split())
    x += dx
    y += dy
    punkty.append((x, y))

print(sum(1 for px, py in punkty if 0 < px < 5000 and 0 < py < 5000))

zbior = set(punkty)
for i in range(len(punkty)):
    for j in range(i + 1, len(punkty)):
        (x1, y1), (x2, y2) = punkty[i], punkty[j]
        if (x1 + x2) % 2 == 0 and (y1 + y2) % 2 == 0:
            s = ((x1 + x2) // 2, (y1 + y2) // 2)
            if s in zbior and s not in (punkty[i], punkty[j]):
                trojka = sorted([punkty[i], punkty[j], s])
                print(", ".join(f"({a}, {b})" for a, b in trojka))
