def rosnaco_malejacy(c):
    n = len(c)
    if n < 4:
        return False
    for k in range(2, n - 1):
        if all(c[i] < c[i + 1] for i in range(k - 1)) and all(c[i] > c[i + 1] for i in range(k, n - 1)):
            return True
    return False


cyfry = [int(w) for w in open("pi.txt") if w.strip()]
print(sum(1 for i in range(len(cyfry) - 5) if rosnaco_malejacy(cyfry[i : i + 6])))
