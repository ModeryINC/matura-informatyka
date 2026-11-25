liczby = [int(w) for w in open("liczby.txt") if w.strip()]
N = max(liczby)
S = [False, False] + [True] * (N - 1)
for i in range(2, int(N**0.5) + 1):
    if S[i]:
        for j in range(i * i, N + 1, i):
            S[j] = False


def rozklady(n):
    return sum(1 for p in range(2, n // 2 + 1) if S[p] and S[n - p])


r = [(n, rozklady(n)) for n in liczby]
najw = max(r, key=lambda x: x[1])
najm = min(r, key=lambda x: x[1])
print(*najw, *najm)
