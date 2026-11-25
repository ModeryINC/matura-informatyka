def czy_poprawny(login):
    if not 4 <= len(login) <= 10 or login[0].isdigit():
        return False
    if any(not (c.isascii() and (c.isalnum() or c == ".")) for c in login):
        return False
    if any(a == b for a, b in zip(login, login[1:])):
        return False
    return any(c.isupper() for c in login) and any(c.islower() for c in login) and any(c.isdigit() for c in login)


print(sum(1 for w in open("loginy.txt") if w.strip() and czy_poprawny(w.strip())))
