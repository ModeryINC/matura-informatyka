def moda(T):
    najlepsza, najwiecej = T[0], 0
    for x in T:
        ile = 0
        for y in T:
            if y == x:
                ile += 1
        if ile > najwiecej:
            najlepsza, najwiecej = x, ile
    return najlepsza
