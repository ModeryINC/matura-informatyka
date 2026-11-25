def liczba_wywolan(i):
    if i <= 2:
        return 1
    if i % 3 == 0:
        return 1 + liczba_wywolan(i - 1)
    if i % 3 == 1:
        return 1 + liczba_wywolan(i - 2) + liczba_wywolan(i - 3)
    return 1 + liczba_wywolan(i - 1) + liczba_wywolan(i - 2)
