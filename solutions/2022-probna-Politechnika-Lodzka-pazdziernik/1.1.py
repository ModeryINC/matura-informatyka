def dzielniki_wlasciwe(x):
    return sum(1 for d in range(1, x) if x % d == 0)
