odbiorcy = [int(w) for w in open("odbiorcy.txt") if w.strip()]
print(len(odbiorcy) - len(set(odbiorcy)))
