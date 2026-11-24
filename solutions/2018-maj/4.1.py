slowa = [w.strip() for w in open("sygnaly.txt") if w.strip()]
print("".join(slowa[i][9] for i in range(39, len(slowa), 40)))
