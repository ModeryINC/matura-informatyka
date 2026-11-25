def runda(k, x, y):
    r = 0
    while x != y:
        x //= 2
        y //= 2
        r += 1
    return r
