def f(s):
    return sum(ord(c) for c in s)


pary = [w.split() for w in open("pary.txt") if w.strip()]
a = min(pary, key=lambda p: f(p[0]) + f(p[1]))
print(a[0], a[1], f(a[0]) + f(a[1]))
b = max(pary, key=lambda p: abs(f(p[0]) - f(p[1])))
print(b[0], b[1], abs(f(b[0]) - f(b[1])))
