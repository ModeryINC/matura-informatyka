def dlugosc(n):
    dl = 0
    while n > 0:
        a = 1
        while (a + 1) * (a + 1) <= n:
            a += 1
        n -= a * a
        dl += 1
    return dl
