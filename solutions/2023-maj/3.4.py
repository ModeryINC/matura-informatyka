def rosnaco_malejacy(c):
    n = len(c)
    if n < 4:
        return False
    for k in range(2, n - 1):
        if all(c[i] < c[i + 1] for i in range(k - 1)) and all(c[i] > c[i + 1] for i in range(k, n - 1)):
            return True
    return False


cyfry = [int(w) for w in open("pi.txt") if w.strip()]
najlepszy = (0, 0)
for i in range(len(cyfry)):
    for dl in range(4, 25):
        if i + dl > len(cyfry):
            break
        if dl > najlepszy[1] and rosnaco_malejacy(cyfry[i : i + dl]):
            najlepszy = (i, dl)
start, dl = najlepszy
print(start + 1)
print("".join(map(str, cyfry[start : start + dl])))
