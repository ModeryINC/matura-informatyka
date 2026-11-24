def suma_kw_cyfr(n):
    s = 0
    while n > 0:
        c = n % 10
        s += c * c
        n //= 10
    return s


def czy_nudna(n):
    odwiedzone = [False] * 1000
    while not odwiedzone[n]:
        if n == 1:
            return True
        odwiedzone[n] = True
        n = suma_kw_cyfr(n)
    return False
