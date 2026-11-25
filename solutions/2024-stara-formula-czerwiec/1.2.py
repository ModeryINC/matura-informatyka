def czy_nieliczna(k):
    poprzedni = 0
    while k > 0:
        bit = k % 2
        if bit == 1 and poprzedni == 1:
            return False
        poprzedni = bit
        k //= 2
    return True
