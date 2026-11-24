for wiersz in open("liczby.txt"):
    if wiersz.strip():
        odbicie = int(wiersz.strip()[::-1])
        if odbicie % 17 == 0:
            print(odbicie)
