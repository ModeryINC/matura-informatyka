def przecinaja(xA, yA, xB, yB, xC, yC, xD, yD):
    def orient(px, py, qx, qy, rx, ry):
        v = (qx - px) * (ry - py) - (qy - py) * (rx - px)
        return 0 if abs(v) < 1e-9 else (1 if v > 0 else -1)

    def na_odcinku(px, py, qx, qy, rx, ry):
        return min(px, qx) - 1e-9 <= rx <= max(px, qx) + 1e-9 and min(py, qy) - 1e-9 <= ry <= max(py, qy) + 1e-9

    o1 = orient(xA, yA, xB, yB, xC, yC)
    o2 = orient(xA, yA, xB, yB, xD, yD)
    o3 = orient(xC, yC, xD, yD, xA, yA)
    o4 = orient(xC, yC, xD, yD, xB, yB)
    if o1 != o2 and o3 != o4:
        return True
    if o1 == 0 and na_odcinku(xA, yA, xB, yB, xC, yC):
        return True
    if o2 == 0 and na_odcinku(xA, yA, xB, yB, xD, yD):
        return True
    if o3 == 0 and na_odcinku(xC, yC, xD, yD, xA, yA):
        return True
    if o4 == 0 and na_odcinku(xC, yC, xD, yD, xB, yB):
        return True
    return False
