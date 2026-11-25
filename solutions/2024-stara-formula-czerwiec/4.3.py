def rot13(s):
    return "".join(chr((ord(c) - 97 + 13) % 26 + 97) for c in s)


slowa = [w.strip() for w in open("slowa.txt") if w.strip()]
pasujace = [s for s in slowa if rot13(s) == s[::-1]]
print(len(pasujace))
print(max(pasujace, key=len))
