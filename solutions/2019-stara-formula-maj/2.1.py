def pot(a, k):
    wynik = 1
    for _ in range(k):
        wynik = wynik * a % k
    return wynik
