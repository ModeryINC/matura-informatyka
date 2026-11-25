def sortuj(tab):
    n = len(tab)
    for i in range(n):
        for j in range(n - 1):
            if tab[j] > tab[j + 1]:
                pom = tab[j + 1]
                tab[j + 1] = tab[j]
                tab[j] = pom
    return tab
