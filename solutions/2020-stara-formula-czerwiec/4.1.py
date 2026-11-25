def pierwsza(n):
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True


pierwsze = [n for n in (int(w) for w in open("dane.txt") if w.strip()) if pierwsza(n)]
print(len(pierwsze))
print(max(pierwsze))
print(min(pierwsze))
