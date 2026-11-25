s = open("mecz.txt").read().strip()
print(sum(1 for a, b in zip(s, s[1:]) if a != b))
