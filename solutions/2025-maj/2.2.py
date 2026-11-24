plansza = [w.strip() for w in open("symbole.txt") if w.strip()]
srodki = []
for i in range(1, len(plansza) - 1):
    for j in range(1, len(plansza[i]) - 1):
        znak = plansza[i][j]
        if all(plansza[i + di][j + dj] == znak for di in (-1, 0, 1) for dj in (-1, 0, 1)):
            srodki.append((i + 1, j + 1))
print(len(srodki))
for w, p in srodki:
    print(w, p)
