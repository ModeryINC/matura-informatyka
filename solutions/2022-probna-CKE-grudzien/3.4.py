from collections import Counter

licznik = Counter("".join(format(int(w), "X") for w in open("liczby.txt") if w.strip()))
for c in "0123456789ABCDEF":
    print(f"{c}:{licznik[c]}")
