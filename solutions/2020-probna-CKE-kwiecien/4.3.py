from collections import Counter

a = [int(w) for w in open("dane4.txt") if w.strip()]
krotnosci = Counter(abs(x - y) for x, y in zip(a, a[1:]))
najw = max(krotnosci.values())
print(najw, *sorted(l for l, k in krotnosci.items() if k == najw))
