from collections import Counter

pary = [w.split() for w in open("pary.txt") if w.strip()]
wspolne_b = [min(s1.count("b"), s2.count("b")) for s1, s2 in pary]
najw = max(wspolne_b)
for (s1, s2), w in zip(pary, wspolne_b):
    if w == najw:
        print(s1, s2)
s1, s2 = max(pary, key=lambda p: sum((Counter(p[0]) & Counter(p[1])).values()))
print(s1, s2)
