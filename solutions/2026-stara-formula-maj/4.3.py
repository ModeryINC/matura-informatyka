def najdluzszy(s1, s2):
    wynik = 0
    for k in range(1, min(len(s1), len(s2)) + 1):
        if s1[:k] == s2[-k:] or s2[:k] == s1[-k:]:
            wynik = k
    return wynik


for wiersz in open("pary.txt"):
    s1, s2 = wiersz.split()
    k = najdluzszy(s1, s2)
    if k >= 5:
        print(s1, s2, k)
