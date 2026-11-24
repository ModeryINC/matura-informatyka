def algorytm(n):
    p, q = 1, n
    while p < q:
        s = (p + q) // 2
        if s * s * s < n:
            p = s + 1
        else:
            q = s
    return p
