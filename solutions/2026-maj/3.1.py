def f(s):
    return sum(ord(c) for c in s)


najlepsza = None
for wiersz in open("pary.txt"):
    s1, s2 = wiersz.split()
    roznica = abs(f(s1) - f(s2))
    if najlepsza is None or roznica > najlepsza[2]:
        najlepsza = (s1, s2, roznica)
print(*najlepsza)
