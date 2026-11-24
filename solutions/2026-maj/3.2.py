from collections import Counter

najlepsza = None
for wiersz in open("pary.txt"):
    s1, s2 = wiersz.split()
    wspolne = sum((Counter(s1) & Counter(s2)).values())
    if najlepsza is None or wspolne > najlepsza[2]:
        najlepsza = (s1, s2, wspolne)
print(*najlepsza)
