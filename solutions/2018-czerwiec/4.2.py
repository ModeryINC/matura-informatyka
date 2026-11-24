def wczytaj(nazwa):
    return [list(map(int, w.split())) for w in open(nazwa) if w.strip()]


A = wczytaj("dane1.txt")
B = wczytaj("dane2.txt")


def po_rowno(c):
    return sum(1 for x in c if x % 2 == 0) == 5


print(sum(1 for a, b in zip(A, B) if po_rowno(a) and po_rowno(b)))
