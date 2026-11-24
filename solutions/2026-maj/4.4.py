szefowie = [int(w) for w in open("korpo.txt")]
n = len(szefowie)
glebokosc = [0] * (n + 1)
for i in range(2, n + 1):
    glebokosc[i] = glebokosc[szefowie[i - 1]] + 1
najwiecej = max(glebokosc[1:])
print(najwiecej, glebokosc[1:].count(najwiecej))
