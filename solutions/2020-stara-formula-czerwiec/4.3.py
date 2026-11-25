from collections import Counter

zbiory = Counter(frozenset(w.strip()) for w in open("dane.txt") if w.strip())
print(sum(k * (k - 1) // 2 for k in zbiory.values()))
