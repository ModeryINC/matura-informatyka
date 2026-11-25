s = open("dane.txt").read().strip()
pary = [s[i : i + 2] for i in range(0, len(s), 2)]
print(sum(1 for a, b in zip(pary, pary[1:]) if a == b))
