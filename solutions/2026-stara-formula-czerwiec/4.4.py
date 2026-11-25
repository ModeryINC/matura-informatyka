from collections import Counter

s = open("dane.txt").read().strip()
licznik = Counter(s[i : i + 2] for i in range(0, len(s), 2))
print("".join(sorted(licznik, key=licznik.get)), max(licznik.values()), min(licznik.values()))
