wiersze = [w.strip() for w in open("szachy.txt") if w.strip()]
plansze = [wiersze[i : i + 8] for i in range(0, len(wiersze), 8)]


def szachuje(p, wieza, krol):
    for r in range(8):
        for c in range(8):
            if p[r][c] != krol:
                continue
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                x, y = r + dr, c + dc
                while 0 <= x < 8 and 0 <= y < 8 and p[x][y] == ".":
                    x, y = x + dr, y + dc
                if 0 <= x < 8 and 0 <= y < 8 and p[x][y] == wieza:
                    return True
    return False


print(sum(szachuje(p, "W", "k") for p in plansze), sum(szachuje(p, "w", "K") for p in plansze))
