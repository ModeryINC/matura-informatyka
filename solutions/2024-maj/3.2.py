def ma_nieparzysta(n):
    return any(int(c) % 2 == 1 for c in str(n))


liczby = [int(w) for w in open("skrot.txt")]
bez_skrotu = [n for n in liczby if not ma_nieparzysta(n)]
print(len(bez_skrotu))
print(max(bez_skrotu))
