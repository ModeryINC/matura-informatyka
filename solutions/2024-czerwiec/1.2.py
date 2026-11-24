def rog(w, k, n):
    # liczba cyfr zapisu binarnego n
    d = 0
    m = n
    while m > 0:
        d += 1
        m //= 2
    # pozycja ostatniej komórki (od 0) w cyklicznym powtarzaniu cyfr
    p = (w * k - 1) % d
    # cyfra na pozycji p, licząc od najbardziej znaczącej
    for _ in range(d - 1 - p):
        n //= 2
    return n % 2
