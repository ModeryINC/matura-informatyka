def pierwsza_parzysta(A):
    lewy, prawy = 0, len(A) - 1
    while lewy < prawy:
        srodek = (lewy + prawy) // 2
        if A[srodek] % 2 == 0:
            prawy = srodek
        else:
            lewy = srodek + 1
    return A[lewy]
