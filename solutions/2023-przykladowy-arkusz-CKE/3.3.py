def pierwsza(n):
    return n > 1 and all(n % d for d in range(2, int(n**0.5) + 1))


print(sum(1 for w in open("liczby.txt") if w.strip() and pierwsza(int(w.split()[0]))))
