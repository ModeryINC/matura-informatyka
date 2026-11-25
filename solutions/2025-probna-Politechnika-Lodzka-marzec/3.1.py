def wspolliniowe(xA, yA, xB, yB, xC, yC):
    return abs((xB - xA) * (yC - yA) - (yB - yA) * (xC - xA)) < 1e-9
