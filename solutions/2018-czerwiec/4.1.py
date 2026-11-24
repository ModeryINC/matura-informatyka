def wczytaj(nazwa):
    return [list(map(int, w.split())) for w in open(nazwa) if w.strip()]


A = wczytaj("dane1.txt")
B = wczytaj("dane2.txt")

print(sum(1 for a, b in zip(A, B) if a[-1] == b[-1]))
