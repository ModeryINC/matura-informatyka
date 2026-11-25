def wywolania(T, x, p, k):
    """Zwraca listę par [p, k] kolejnych wywołań Rek (numeracja tablicy od 1)."""
    lista = [[p, k]]
    while p < k:
        s = (p + k) // 2
        if T[s - 1] >= x:
            k = s
        else:
            p = s + 1
        lista.append([p, k])
    return lista
