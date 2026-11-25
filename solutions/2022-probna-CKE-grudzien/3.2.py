def pierwsza(n):
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True


print(sum(1 for w in open("liczby.txt") if w.strip() and pierwsza(int(w) - 1)))
