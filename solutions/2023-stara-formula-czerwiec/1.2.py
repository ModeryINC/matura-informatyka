def suma_cyfr(n):
    s = 0
    while n > 0:
        s += n % 10
        n //= 10
    return s


def pierwsza_cyfra(n):
    while n >= 10:
        n //= 10
    return n


def dobre_przyjaciolki(a, b):
    if suma_cyfr(a) != suma_cyfr(b):
        return False
    return pierwsza_cyfra(a) == b % 10 or pierwsza_cyfra(b) == a % 10
