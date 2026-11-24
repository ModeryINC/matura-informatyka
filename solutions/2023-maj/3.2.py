cyfry = "".join(w.strip() for w in open("pi.txt"))
licznik = {f"{k:02d}": 0 for k in range(100)}
for i in range(len(cyfry) - 1):
    licznik[cyfry[i : i + 2]] += 1
najmniej = min(licznik, key=lambda f: (licznik[f], f))
najwiecej = min(licznik, key=lambda f: (-licznik[f], f))
print(najmniej, licznik[najmniej])
print(najwiecej, licznik[najwiecej])
