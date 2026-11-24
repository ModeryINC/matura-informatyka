def liczba_dodawan(x, y):
    if y == 1:
        return 0
    k = y // 2
    if y % 2 == 0:
        return liczba_dodawan(x, k) + 1
    return liczba_dodawan(x, k) + 2
