prost = [tuple(map(int, w.split())) for w in open("prostokaty.txt") if w.strip()]

najlepszy = (1, prost[0])
dl = 1
for i in range(1, len(prost)):
    (h0, s0), (h, s) = prost[i - 1], prost[i]
    dl = dl + 1 if h <= h0 and s <= s0 else 1
    if dl > najlepszy[0]:
        najlepszy = (dl, prost[i])
print(najlepszy[0], *najlepszy[1])
