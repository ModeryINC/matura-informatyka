def czy_deficytowa(x):
    return sum(d for d in range(1, x) if x % d == 0) < x
