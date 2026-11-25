def pot(a, k):
    wynik = 1
    for _ in range(k):
        wynik = wynik * a % k
    return wynik


def testF(k):
    for a in range(2, k):
        if pot(a, k) != a:
            return 0
    return 1


def czyLC(k):
    zlozona = any(k % d == 0 for d in range(2, k))
    return 1 if zlozona and testF(k) == 1 else 0
