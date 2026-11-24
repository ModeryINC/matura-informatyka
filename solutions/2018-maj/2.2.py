def uporzadkuj(X, Y):
    n = len(X)
    for i in range(n):
        m = i
        for j in range(i + 1, n):
            if X[j] * Y[m] < X[m] * Y[j]:
                m = j
        X[i], X[m] = X[m], X[i]
        Y[i], Y[m] = Y[m], Y[i]
    return [X, Y]
