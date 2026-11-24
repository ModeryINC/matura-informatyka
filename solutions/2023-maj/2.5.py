for wiersz in open("bin.txt"):
    if wiersz.strip():
        p = int(wiersz, 2)
        print(bin(p ^ (p // 2))[2:])
