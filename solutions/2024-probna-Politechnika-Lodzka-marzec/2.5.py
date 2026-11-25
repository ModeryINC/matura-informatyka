def na_odcinku(px, py, ax, ay, bx, by):
    return (bx - ax) * (py - ay) == (by - ay) * (px - ax) and min(ax, bx) <= px <= max(ax, bx) and min(ay, by) <= py <= max(ay, by)


def w_wielokacie(punkty, px, py):
    n = len(punkty)
    wewnatrz = False
    for i in range(n):
        (ax, ay), (bx, by) = punkty[i], punkty[(i + 1) % n]
        if na_odcinku(px, py, ax, ay, bx, by):
            return True
        if (ay > py) != (by > py):
            x = ax + (py - ay) * (bx - ax) / (by - ay)
            if x > px:
                wewnatrz = not wewnatrz
    return wewnatrz


licznik = 0
for wiersz in open("punkty.txt"):
    t = list(map(float, wiersz.split()))
    if t:
        n = int(t[0])
        punkty = [(t[1 + 2 * i], t[2 + 2 * i]) for i in range(n)]
        if w_wielokacie(punkty, t[1 + 2 * n], t[2 + 2 * n]):
            licznik += 1
print(licznik)
