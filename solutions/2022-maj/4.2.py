def czynniki(n):
    wynik = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            wynik.append(d)
            n //= d
        d += 1
    if n > 1:
        wynik.append(n)
    return wynik


liczby = [int(w) for w in open("liczby.txt") if w.strip()]
a = max(liczby, key=lambda x: len(czynniki(x)))
b = max(liczby, key=lambda x: len(set(czynniki(x))))
print(a, len(czynniki(a)), b, len(set(czynniki(b))))
