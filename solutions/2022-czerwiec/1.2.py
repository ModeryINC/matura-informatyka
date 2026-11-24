def suma_kw_cyfr(n):
    s = 0
    while n > 0:
        c = n % 10
        s += c * c
        n //= 10
    return s
