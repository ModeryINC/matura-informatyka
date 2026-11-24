def potega_trojki(n):
    while n % 3 == 0:
        n //= 3
    return n == 1


print(sum(1 for w in open("liczby.txt") if w.strip() and potega_trojki(int(w))))
