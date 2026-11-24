liczby = [int(w) for w in open("liczby.txt") if w.strip()]
n = max(liczby, key=lambda x: abs(x - int(str(x)[::-1])))
print(n, abs(n - int(str(n)[::-1])))
