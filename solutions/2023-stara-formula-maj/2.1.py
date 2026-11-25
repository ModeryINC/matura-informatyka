def przestaw(A):
    def f(p, q):
        if p < q:
            k = (q - p + 1) // 2
            for i in range(1, k + 1):
                a, b = p + i - 1, q - k + i
                A[a - 1], A[b - 1] = A[b - 1], A[a - 1]
            f(p, p + k - 1)
            f(q - k + 1, q)

    f(1, len(A))
    return A
