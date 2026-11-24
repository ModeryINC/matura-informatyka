def czy_mniejszy(n, s, k1, k2):
    i, j = k1 - 1, k2 - 1
    while i < n and j < n:
        if s[i] == s[j]:
            i += 1
            j += 1
        elif s[i] < s[j]:
            return True
        else:
            return False
    return j < n


with open("slowa.txt") as plik:
    n = int(plik.readline())
    s = plik.readline().strip()
    k1, k2 = map(int, plik.readline().split())
print("TAK" if czy_mniejszy(n, s, k1, k2) else "NIE")
