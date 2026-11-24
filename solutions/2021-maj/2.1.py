def d(T, x):
    T.append(x)
    s = len(T)  # numeracja od 1, jak w arkuszu
    while s // 2 >= 1 and T[s - 1] > T[s // 2 - 1]:
        T[s - 1], T[s // 2 - 1] = T[s // 2 - 1], T[s - 1]
        s //= 2
    return T
