def licz_wyrazy(linia):
    n = m = 0
    for znak in linia:
        if znak != " ":
            m += 1
        else:
            if m > 1:
                n += 1
            m = 0
    return n + 1 if m > 1 else n
