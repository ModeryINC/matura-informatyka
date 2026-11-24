def ma_fragment(s):
    return any(s[i] == "k" and s[i + 2] == "t" for i in range(len(s) - 2))


print(sum(1 for w in open("slowa.txt") if w.strip() and ma_fragment(w.strip())))
