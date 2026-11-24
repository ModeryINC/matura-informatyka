def skrajnie_lewy(X, Y):
    najlepszy = 0
    for i in range(1, len(X)):
        # X[i]/Y[i] < X[b]/Y[b]  <=>  X[i]*Y[b] < X[b]*Y[i]  (Y dodatnie)
        if X[i] * Y[najlepszy] < X[najlepszy] * Y[i]:
            najlepszy = i
    return [X[najlepszy], Y[najlepszy]]
