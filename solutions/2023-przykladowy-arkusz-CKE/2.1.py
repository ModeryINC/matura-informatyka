def gra(A, s):
    B = [False] * (s + 1)
    B[0] = True
    for a in A:
        for i in range(s, a - 1, -1):
            if B[i - a] and not B[i]:
                B[i] = True
    return B[s]
