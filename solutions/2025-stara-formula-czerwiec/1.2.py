def rozklad(n):
    """Zwraca listę [P[2], ..., P[n]]: 1 – pierwsza, 2 – iloczyn dwóch różnych pierwszych, 3 – inna."""
    P = [0] * (n + 1)
    for i in range(2, n + 1):  # najmniejszy czynnik pierwszy
        d = 2
        while i % d != 0:
            d += 1
        P[i] = d
    wynik = []
    for i in range(2, n + 1):
        if P[i] == i:
            wynik.append(1)
        else:
            j1 = P[i]
            j2 = i // j1
            wynik.append(2 if j1 != j2 and P[j2] == j2 else 3)
    return wynik
