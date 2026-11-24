cyfry = [w.strip() for w in open("pi.txt") if w.strip()]
print(sum(1 for i in range(len(cyfry) - 1) if int(cyfry[i] + cyfry[i + 1]) > 90))
