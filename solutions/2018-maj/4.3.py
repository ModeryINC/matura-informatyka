for wiersz in open("sygnaly.txt"):
    slowo = wiersz.strip()
    if slowo and ord(max(slowo)) - ord(min(slowo)) <= 10:
        print(slowo)
