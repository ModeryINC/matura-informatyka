for wiersz in open("symbole.txt"):
    napis = wiersz.strip()
    if napis == napis[::-1]:
        print(napis)
