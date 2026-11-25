def czy_poprawny(login):
    if not 4 <= len(login) <= 10:
        return False
    if login[0].isdigit():
        return False
    duza = mala = cyfra = False
    for i, c in enumerate(login):
        if "A" <= c <= "Z":
            duza = True
        elif "a" <= c <= "z":
            mala = True
        elif "0" <= c <= "9":
            cyfra = True
        elif c != ".":
            return False
        if i > 0 and login[i - 1] == c:
            return False
    return duza and mala and cyfra
