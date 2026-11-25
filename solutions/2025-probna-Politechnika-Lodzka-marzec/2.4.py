def dlugosc_fareya(n):
    from math import gcd

    return 1 + sum(1 for l in range(1, n + 1) for k in range(1, l + 1) if gcd(k, l) == 1)
