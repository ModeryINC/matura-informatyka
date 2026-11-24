def wczytaj(nazwa):
    return [list(map(int, w.split())) for w in open(nazwa) if w.strip()]


A = wczytaj("dane1.txt")
B = wczytaj("dane2.txt")

wiersze = [i + 1 for i, (a, b) in enumerate(zip(A, B)) if set(a) == set(b)]
print(len(wiersze))
print(*wiersze)
