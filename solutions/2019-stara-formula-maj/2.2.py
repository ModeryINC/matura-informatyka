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
