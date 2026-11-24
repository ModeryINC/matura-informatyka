def deszyfruj(S, k):
    n = len(S)
    kolumny = n // k
    # wiersz i, kolumna j (od 0) szyfrogramu to S[i * kolumny + j]
    T = []
    for j in range(kolumny):
        wiersze = range(k) if j % 2 == 0 else range(k - 1, -1, -1)
        for i in wiersze:
            T.append(S[i * kolumny + j])
    return "".join(T)
