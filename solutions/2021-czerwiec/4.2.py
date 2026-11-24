wiersze = [w.strip() for w in open("napisy.txt") if w.strip()]
print("".join(wiersze[20 * i - 1][i - 1] for i in range(1, 51)))
