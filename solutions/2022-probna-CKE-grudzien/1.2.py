s = open("mecz.txt").read().strip()
a = b = 0
for c in s:
    if c == "A":
        a += 1
    else:
        b += 1
    if (a >= 1000 or b >= 1000) and abs(a - b) >= 3:
        print("A" if a > b else "B", f"{a}:{b}")
        break
