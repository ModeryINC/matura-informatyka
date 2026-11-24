odbiorcy = [int(w) for w in open("odbiorcy.txt") if w.strip()]
n = len(odbiorcy)
polozenie = list(range(1, n + 1))  # polozenie[p - 1] = komputer z pakietem p
runda = 0
while True:
    runda += 1
    polozenie = [odbiorcy[k - 1] for k in polozenie]
    wrocily = [p for p in range(1, n + 1) if polozenie[p - 1] == p]
    if wrocily:
        print(runda, wrocily[0])
        break
