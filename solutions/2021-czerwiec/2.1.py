def modyfikuj(T, s, k):
    n = len(T)

    def mod(s):
        if s + k < n:
            mod(s + k)
        i = s + 1
        while i <= n and i <= s + k:
            T[s - 1] += T[i - 1]
            i += 1

    mod(s)
    return T
