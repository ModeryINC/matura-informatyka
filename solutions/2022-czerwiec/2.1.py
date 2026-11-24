def koduj(n):
    if n == 1:
        return ""
    k = n // 2
    if k % 2 == 0:
        return koduj(k) + "A"
    return "B" + koduj(k)
