def wczytaj(nazwa):
    return [list(map(int, w.split())) for w in open(nazwa) if w.strip()]


A = wczytaj("dane1.txt")
B = wczytaj("dane2.txt")

for a, b in zip(A, B):
    i = j = 0
    wynik = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            wynik.append(a[i])
            i += 1
        else:
            wynik.append(b[j])
            j += 1
    wynik += a[i:] + b[j:]
    print(*wynik)
