def czy_automorficzna(n):
    potega = 1
    m = n
    while m > 0:
        potega *= 10
        m //= 10
    return (n * n) % potega == n
