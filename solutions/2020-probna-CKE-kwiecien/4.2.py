a = [int(w) for w in open("dane4.txt") if w.strip()]
najlepszy = (2, 0)  # (długość, początek)
start = 0
for i in range(1, len(a) - 1):
    if abs(a[i + 1] - a[i]) != abs(a[i] - a[i - 1]):
        start = i
    dlugosc = i + 2 - start
    if dlugosc > najlepszy[0]:
        najlepszy = (dlugosc, start)
d, s = najlepszy
print(d, a[s], a[s + d - 1])
