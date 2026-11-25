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
wynik = []
for i in range(0, len(s), 2):
    para = s[i : i + 2]
    if para not in wynik and pierwsza(ord(para[0]) + ord(para[1])):
        wynik.append(para)
print(*wynik)
