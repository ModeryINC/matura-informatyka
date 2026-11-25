def szyfr(T, k):
    n = len(T)
    a = n // k
    c = n - a
    S = [""] * (n + 1)  # numeracja od 1
    for i in range(1, n + 1):
        if i % k == 0:
            b = i // k
            S[n - a + b] = T[i - 1]
        else:
            S[c] = T[i - 1]
            c -= 1
    return "".join(S[1:])
