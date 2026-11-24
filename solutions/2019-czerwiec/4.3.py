def waga(n):
    while n >= 10:
        n = sum(int(c) for c in str(n))
    return n


print(sum(1 for w in open("pierwsze.txt") if w.strip() and waga(int(w)) == 1))
