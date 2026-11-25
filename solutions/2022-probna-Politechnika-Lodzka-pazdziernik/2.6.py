with open("dane.txt") as plik:
    plik.readline()
    n = int(plik.readline())
    print(sum(1 for _ in range(n) if plik.readline().split()[0] == "0"))
