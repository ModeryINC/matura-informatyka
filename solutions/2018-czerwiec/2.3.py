def fib(n):
    if n <= 2:
        return 1
    if n % 2 == 0:
        k = n // 2
        return fib(k + 1) ** 2 - fib(k - 1) ** 2
    k = (n + 1) // 2
    return fib(k) ** 2 + fib(k - 1) ** 2
