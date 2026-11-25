def jedynki_bcd(L):
    w = 0
    while L > 0:
        c = L % 10
        while c > 0:
            w += c % 2
            c //= 2
        L //= 10
    return w
