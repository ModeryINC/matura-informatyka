from collections import Counter

tekst = open("dane.txt").read()
cyfra, ile = Counter(c for c in tekst if c.isdigit()).most_common(1)[0]
print(cyfra, ile)
