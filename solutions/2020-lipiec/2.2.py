def egipskie(p, q):
    wynik = []
    while p > 0:
        n = (q + p - 1) // p  # sufit z q / p
        wynik.append(n)
        p, q = p * n - q, q * n
    return wynik
