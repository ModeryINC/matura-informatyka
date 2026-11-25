a = [int(w) for w in open("dane4.txt") if w.strip()]
luki = [abs(x - y) for x, y in zip(a, a[1:])]
print(max(luki), min(luki))
