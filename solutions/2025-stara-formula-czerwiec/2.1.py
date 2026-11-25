def f(a, b):
    if b == 0:
        return 0
    k = b % 10
    w = f(a, b // 10) * 10
    while k > 0:
        w += a
        k -= 1
    return w
