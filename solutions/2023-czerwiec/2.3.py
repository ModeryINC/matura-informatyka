def czy_mniejszy(n, s, k1, k2):
    i, j = k1 - 1, k2 - 1
    while i < n and j < n:
        if s[i] == s[j]:
            i += 1
            j += 1
        elif s[i] < s[j]:
            return True
        else:
            return False
    return j < n


def sufiksy(s):
    n = len(s)
    T = list(range(1, n + 1))
    # sortowanie przez wstawianie z porównaniem czy_mniejszy
    for a in range(1, n):
        x = T[a]
        b = a - 1
        while b >= 0 and czy_mniejszy(n, s, x, T[b]):
            T[b + 1] = T[b]
            b -= 1
        T[b + 1] = x
    return T
