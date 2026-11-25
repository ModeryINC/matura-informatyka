P = [list(map(int, w.split())) for w in open("plansza.txt") if w.strip()]
n = len(P)


def pole(r, c):
    return P[r][c] if 0 <= r < n and 0 <= c < n else 0


def statki():
    """Zwraca listę statków jako list pól (składowe spójne po bokach)."""
    widziane = set()
    wynik = []
    for r in range(n):
        for c in range(n):
            if P[r][c] == 1 and (r, c) not in widziane:
                stos, statek = [(r, c)], []
                widziane.add((r, c))
                while stos:
                    a, b = stos.pop()
                    statek.append((a, b))
                    for da, db in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        x, y = a + da, b + db
                        if pole(x, y) == 1 and (x, y) not in widziane:
                            widziane.add((x, y))
                            stos.append((x, y))
                wynik.append(statek)
    return wynik

na_przek = lambda s: any(r == c or r + c == n - 1 for r, c in s)
ss = statki()
print(sum(1 for s in ss if len(s) == 1 and na_przek(s)))
print(sum(1 for s in ss if len(s) == 2 and na_przek(s)))
