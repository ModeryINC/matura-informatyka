liczby = [str(int(w, 2)) for w in open("anagram.txt") if w.strip()]
print(sum(1 for s in liczby if "0" not in s))
print(max(liczby, key=lambda s: sum(int(c) for c in set(s))))
