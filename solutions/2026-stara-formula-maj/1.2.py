def A(m, n):
    if n == 1:
        return m
    if n % 2 == 0:
        return A(2 * m, n // 2)
    return 2 * A(m, (n - 1) // 2) + m
