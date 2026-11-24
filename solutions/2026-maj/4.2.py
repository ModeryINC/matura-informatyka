szefowie = [int(w) for w in open("korpo.txt")]
majacy_podwladnych = set(szefowie[1:])
print(len(szefowie) - len(majacy_podwladnych))
