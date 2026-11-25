def wyraz_ciagu(i):
    if i == 1:
        return 2
    if i == 2:
        return 1
    if i % 3 == 0:
        return 2 * wyraz_ciagu(i - 1)
    if i % 3 == 1:
        return wyraz_ciagu(i - 2) - wyraz_ciagu(i - 3)
    return wyraz_ciagu(i - 1) + wyraz_ciagu(i - 2)
