def pierwsza(n):
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True


s = open("dane.txt").read().strip()
prefiks = [0]
for c in s:
    prefiks.append(prefiks[-1] + ord(c))
najlepszy = ""
for i in range(0, len(s), 2):
    for j in range(i + 2, len(s) + 1, 2):
        if j - i > len(najlepszy) and pierwsza(prefiks[j] - prefiks[i]):
            najlepszy = s[i:j]
print(najlepszy, sum(ord(c) for c in najlepszy))
