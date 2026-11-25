import re

s = open("mecz.txt").read().strip()
passy = [m.group() for m in re.finditer(r"A+|B+", s) if len(m.group()) >= 10]
najdluzsza = max(passy, key=len)
print(len(passy), najdluzsza[0], len(najdluzsza))
