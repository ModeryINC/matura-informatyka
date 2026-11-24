def czy_k_podobne(A, B, k):
    n = len(A)
    for i in range(n):
        # A[i] (od 0) odpowiada B[(i - k) mod n]: A[1..k] = B[n-k+1..n], A[k+1..n] = B[1..n-k]
        if A[i] != B[(i - k) % n]:
            return False
    return True
