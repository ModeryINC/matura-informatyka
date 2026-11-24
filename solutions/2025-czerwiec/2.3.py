def stopien(n):
    s = str(n * n)
    return sum(1 for i in range(1, len(s)) if int(s[:i]) + int(s[i:]) <= n)


liczby = [int(w) for w in open("liczby2.txt") if w.strip()]
najlepsza = max(liczby, key=stopien)
print(stopien(najlepsza))
print(najlepsza)
