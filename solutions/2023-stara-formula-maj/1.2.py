def dlugosc_opisu(A):
    w = 2
    for i in range(1, len(A)):
        if A[i] != A[i - 1]:
            w += 2
    return w
