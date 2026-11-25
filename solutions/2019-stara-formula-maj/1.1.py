def tablica_c(A):
    C = []
    for i in range(len(A)):
        c = 1
        for j in range(i):
            if A[j] < A[i] and C[j] + 1 > c:
                c = C[j] + 1
        C.append(c)
    return C
