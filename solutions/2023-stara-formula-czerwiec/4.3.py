liczby = [int(w, 2) for w in open("anagram.txt") if w.strip()]
print(bin(max(abs(a - b) for a, b in zip(liczby, liczby[1:])))[2:])
