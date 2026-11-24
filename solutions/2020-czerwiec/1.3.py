def czy_k_podobne(A, B, k):
    n = len(A)
    for i in range(n):
        if A[i] != B[(i - k) % n]:
            return False
    return True


def czy_podobne(A, B):
    for k in range(len(A)):
        if czy_k_podobne(A, B, k):
            return True
    return False
