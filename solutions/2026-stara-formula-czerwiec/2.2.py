def najwieksze_k(T):
    n = len(T)
    for k in range(n - 1, 0, -1):
        i = 0
        while i < k and T[i] == T[n - k + i]:
            i += 1
        if i == k:
            return k
    return 0
