for wiersz in open("pary.txt"):
    if wiersz.strip():
        x, y = map(int, wiersz.split())
        z = y // 2
        while z > x:
            z //= 2
        if z == x:
            print(x, y)
