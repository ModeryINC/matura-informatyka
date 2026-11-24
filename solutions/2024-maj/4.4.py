with open("liczby.txt") as plik:
    a = list(map(int, plik.readline().split()))

prefiks = [0]
for x in a:
    prefiks.append(prefiks[-1] + x)

najlepsza = None
for i in range(len(a)):
    for j in range(i + 50, len(a) + 1):
        srednia = (prefiks[j] - prefiks[i]) / (j - i)
        if najlepsza is None or srednia > najlepsza[0]:
            najlepsza = (srednia, j - i, a[i])
print(f"{najlepsza[0]:.2f} {najlepsza[1]} {najlepsza[2]}")
