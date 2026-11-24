def bloki(n):
    b = 1
    poprzednia = n % 2
    n //= 2
    while n > 0:
        cyfra = n % 2
        if cyfra != poprzednia:
            b += 1
        poprzednia = cyfra
        n //= 2
    return b
