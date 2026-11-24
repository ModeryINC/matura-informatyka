def ciecie(k):
    cyfry = 0
    m = k
    while m > 0:
        cyfry += 1
        m //= 10
    dzielnik = 1
    for _ in range(cyfry // 2):
        dzielnik *= 10
    return [k // dzielnik, k % dzielnik]
