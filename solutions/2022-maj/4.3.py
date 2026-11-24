liczby = [int(w) for w in open("liczby.txt") if w.strip()]
liczby.sort()
n = len(liczby)
# dzielniki[i] = indeksy j < i, takie że liczby[j] dzieli liczby[i]
dzielniki = [[j for j in range(i) if liczby[i] % liczby[j] == 0] for i in range(n)]

# lancuchy[d][i] = liczba łańcuchów długości d kończących się na liczby[i]
lancuchy = [[1] * n]
for d in range(1, 5):
    lancuchy.append([sum(lancuchy[d - 1][j] for j in dzielniki[i]) for i in range(n)])

print(sum(lancuchy[2]))
print(sum(lancuchy[4]))
