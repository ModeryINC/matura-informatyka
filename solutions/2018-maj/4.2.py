slowa = [w.strip() for w in open("sygnaly.txt") if w.strip()]
najlepsze = max(slowa, key=lambda s: len(set(s)))
print(najlepsze, len(set(najlepsze)))
