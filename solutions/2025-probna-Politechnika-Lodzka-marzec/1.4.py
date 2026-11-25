def podzielna_przez_9(x):
    s, y = 0, x
    while y > 0:
        s += y % 10
        y //= 10
    return x - s % 9
