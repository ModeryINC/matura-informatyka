for wiersz in open("pary.txt"):
    slowo = wiersz.split()[1]
    najlepszy = slowo[0]
    biezacy = slowo[0]
    for znak in slowo[1:]:
        biezacy = biezacy + znak if znak == biezacy[0] else znak
        if len(biezacy) > len(najlepszy):
            najlepszy = biezacy
    print(najlepszy, len(najlepszy))
