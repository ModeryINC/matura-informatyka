def podmiany(A):
    n = len(A)
    wystapila = [False] * (n + 1)
    k = 0
    for x in A:
        if 1 <= x <= n and not wystapila[x]:
            wystapila[x] = True
        else:
            k += 1
    return k
