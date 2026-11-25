def przeniesienia(a, b):
    p = 0
    przeniesienie = 0
    while a > 0 or b > 0:
        suma = a % 10 + b % 10 + przeniesienie
        if suma >= 10:
            przeniesienie = 1
            p += 1
        else:
            przeniesienie = 0
        a //= 10
        b //= 10
    return p
