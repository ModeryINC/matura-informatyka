def szyfruj(tekst, klucz):
    return "".join(chr((ord(c) - 65 + int(klucz[i % len(klucz)])) % 26 + 65) for i, c in enumerate(tekst))
