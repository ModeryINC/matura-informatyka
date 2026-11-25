def sito(N):
    S = [False, False] + [True] * (N - 1)
    i = 2
    while i * i <= N:
        if S[i]:
            j = i * i
            while j <= N:
                S[j] = False
                j += i
        i += 1
    return [i for i in range(2, N + 1) if S[i]]
