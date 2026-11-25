/**
 * Treść podstrony „Podstawy Pythona”: krótkie wyjaśnienia i przykłady,
 * które można edytować i uruchomić w przeglądarce.
 *
 * Każdy przykład jest uruchamiany w CI prawdziwym Pythonem
 * (`npm run verify:basics`), więc nie może kończyć się błędem.
 */

export interface BasicsExample {
  code: string;
  /** Dane dla `input()` (kolejne linie). */
  stdin?: string;
}

export interface BasicsSection {
  id: string;
  title: string;
  /** Akapity wprowadzenia; `kod` w odwrotnych apostrofach. */
  intro: string[];
  examples: BasicsExample[];
  /** Wskazówki maturalne / typowe pułapki. */
  tips?: string[];
}

export const PYTHON_BASICS: BasicsSection[] = [
  {
    id: 'zmienne',
    title: 'Zmienne i typy',
    intro: [
      'Zmienna to nazwa przypisana do wartości. Python sam rozpoznaje typ: `int` (liczba całkowita), `float` (rzeczywista), `str` (napis), `bool` (`True`/`False`).',
      'Typ zmienia się konwersją: `int("42")`, `float("2.5")`, `str(100)`. Funkcja `type()` pokazuje typ wartości.',
    ],
    examples: [
      {
        code: `liczba = 10        # int
ulamek = 3.5       # float
napis = "matura"   # str
prawda = True      # bool
print(type(liczba), type(ulamek), type(napis), type(prawda))

# Konwersje typów
print(int("42") + 1, float("2.5") * 2, str(100) + "%")
print(int(7.9))    # obcina część ułamkową -> 7
`,
      },
    ],
    tips: [
      'Z pliku zawsze czytasz napisy – liczby trzeba zamienić przez `int()`, inaczej `"10" < "9"` (porównanie napisów znak po znaku).',
    ],
  },
  {
    id: 'operatory',
    title: 'Operatory',
    intro: [
      'Arytmetyka: `+ - * /`, dzielenie całkowite `//`, reszta z dzielenia `%`, potęgowanie `**`. Zwykłe dzielenie `/` zawsze daje `float`.',
      'Porównania: `== != < <= > >=` (można je łączyć: `10 <= x <= 20`). Logika: `and`, `or`, `not`.',
    ],
    examples: [
      {
        code: `print(17 // 5)   # 3    – dzielenie całkowite
print(17 % 5)    # 2    – reszta z dzielenia (modulo)
print(2 ** 10)   # 1024 – potęgowanie
print(17 / 5)    # 3.4  – zwykłe dzielenie (float)
print(-7 // 2, -7 % 2)   # -4 1 – zaokrąglenie w dół!

x = 15
print(10 <= x <= 20 and not x == 12)
`,
      },
    ],
    tips: [
      '`n % 10` to ostatnia cyfra liczby, a `n // 10` usuwa ostatnią cyfrę – podstawa wielu zadań „na cyfrach”.',
      '`n % 2 == 0` – liczba parzysta; `a % b == 0` – `b` jest dzielnikiem `a`.',
    ],
  },
  {
    id: 'warunki',
    title: 'Instrukcje warunkowe',
    intro: [
      '`if` – `elif` – `else`. Blok kodu wyznacza wcięcie (4 spacje). Sprawdzany jest pierwszy spełniony warunek, reszta jest pomijana.',
    ],
    examples: [
      {
        code: `x = 15
if x % 2 == 0:
    print(x, "jest parzyste")
elif x % 5 == 0:
    print(x, "jest nieparzyste i podzielne przez 5")
else:
    print(x, "jest nieparzyste")

# Wyrażenie warunkowe w jednej linii
opis = "parzysta" if x % 2 == 0 else "nieparzysta"
print(opis)
`,
      },
    ],
  },
  {
    id: 'petle',
    title: 'Pętle',
    intro: [
      '`for` przechodzi po elementach (listy, napisu, `range`). `range(stop)`, `range(start, stop)`, `range(start, stop, krok)` – `stop` nie wchodzi do zakresu.',
      '`while` powtarza, dopóki warunek jest prawdziwy. `break` przerywa pętlę, `continue` przechodzi do następnego obrotu.',
    ],
    examples: [
      {
        code: `for i in range(5):            # 0 1 2 3 4
    print(i, end=" ")
print()
for i in range(10, 0, -2):    # 10 8 6 4 2
    print(i, end=" ")
print()

# Suma cyfr pętlą while
n = 1234
suma_cyfr = 0
while n > 0:
    suma_cyfr += n % 10
    n //= 10
print("Suma cyfr 1234:", suma_cyfr)

# break i continue
for i in range(1, 20):
    if i % 3 == 0:
        continue      # pomiń wielokrotności 3
    if i > 10:
        break         # zakończ pętlę
    print(i, end=" ")
print()
`,
      },
      {
        code: `# enumerate – indeks i element jednocześnie
for i, owoc in enumerate(["jabłko", "gruszka", "śliwka"]):
    print(i, owoc)

# zip – dwie listy równolegle
for imie, wynik in zip(["Ala", "Ola"], [87, 92]):
    print(imie, wynik)
`,
      },
    ],
    tips: [
      'Najczęstszy błąd: o jeden za dużo / za mało. `range(1, n)` kończy się na `n - 1`; dla 1…n pisz `range(1, n + 1)`.',
    ],
  },
  {
    id: 'listy',
    title: 'Listy',
    intro: [
      'Lista to uporządkowany ciąg elementów: `[5, 3, 8]`. Indeksy liczymy od 0, a `t[-1]` to ostatni element. Wycinek `t[a:b]` to elementy od `a` do `b - 1`.',
      'Przydatne: `append`, `pop`, `len`, `sum`, `min`, `max`, `count`, `in`, `sorted`. Listę „z warunkiem” najkrócej tworzy wyrażenie listowe: `[x * x for x in t if x > 0]`.',
    ],
    examples: [
      {
        code: `lista = [5, 3, 8, 1, 9, 2]
lista.append(7)          # dodanie na koniec
lista.pop()              # usunięcie ostatniego
print(lista, len(lista))
print(lista[0], lista[-1])       # pierwszy i ostatni
print(lista[:3], lista[2:4])     # wycinki
print(sum(lista), min(lista), max(lista))
print(lista.count(8), 9 in lista)
print(sorted(lista), sorted(lista, reverse=True))
`,
      },
      {
        code: `# Wyrażenia listowe
kwadraty = [i * i for i in range(1, 6)]
parzyste = [x for x in [5, 3, 8, 1, 9, 2] if x % 2 == 0]
print(kwadraty, parzyste)

# Lista dwuwymiarowa (plansza, obraz z pikseli)
plansza = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print(plansza[1][2])                 # wiersz 1, kolumna 2 -> 6
for wiersz in plansza:
    print(*wiersz)                   # wypisanie wiersza bez nawiasów
print([plansza[i][i] for i in range(3)])   # przekątna

# Pusta plansza 3 x 4 – tak, a NIE [[0] * 4] * 3
pusta = [[0] * 4 for _ in range(3)]
pusta[0][0] = 1
print(pusta)
`,
      },
    ],
    tips: [
      'W zadaniach „zapisz algorytm” często nie wolno używać `sum`, `min`, `max`, `sorted` czy wycinków – trzeba je napisać pętlą. Takie zadania mają na stronie oznaczenie „Bez funkcji wbudowanych”.',
    ],
  },
  {
    id: 'napisy',
    title: 'Napisy',
    intro: [
      'Napis (`str`) działa jak lista znaków: ma długość, indeksy i wycinki, ale nie można go zmieniać w miejscu – każda operacja tworzy nowy napis.',
      'Przydatne metody: `upper`, `lower`, `count`, `split` (podział na słowa), `join` (sklejenie), `strip` (usunięcie białych znaków z końców), `replace`. Kody znaków: `ord("A")` = 65, `chr(66)` = `"B"`.',
    ],
    examples: [
      {
        code: `s = "Informatyka"
print(len(s), s[0], s[-1], s[2:6])
print(s.upper(), s.lower())
print(s[::-1])                  # odwrócenie napisu
print(s.count("a"), "for" in s)
print("a b  c".split())         # ['a', 'b', 'c']
print("-".join(["a", "b", "c"]))
print("  linia z pliku\\n".strip())
print(ord("A"), chr(66), ord("b") - ord("a"))
`,
      },
      {
        code: `def czy_palindrom(slowo):
    return slowo == slowo[::-1]

def szyfr_cezara(tekst, klucz):
    wynik = ""
    for znak in tekst:
        if "A" <= znak <= "Z":
            wynik += chr((ord(znak) - ord("A") + klucz) % 26 + ord("A"))
        else:
            wynik += znak
    return wynik

print(czy_palindrom("kajak"), czy_palindrom("kot"))
print(szyfr_cezara("MATURA", 3))
print(sorted("kot") == sorted("tok"))   # anagramy
`,
      },
    ],
  },
  {
    id: 'funkcje',
    title: 'Funkcje',
    intro: [
      '`def nazwa(parametry):` tworzy funkcję, a `return` zwraca wynik. Parametr może mieć wartość domyślną, a funkcja może zwrócić kilka wartości naraz (krotkę).',
      'Dzielenie rozwiązania na małe funkcje (np. `czy_pierwsza`, `suma_cyfr`) ułatwia testowanie i ponowne użycie w kolejnych podpunktach.',
    ],
    examples: [
      {
        code: `def powitanie(imie, znak="!"):
    return "Cześć " + imie + znak

def min_max(t):
    najmn = najw = t[0]
    for x in t:
        if x < najmn:
            najmn = x
        if x > najw:
            najw = x
    return najmn, najw            # krotka

def dodaj(*liczby):               # dowolna liczba argumentów
    wynik = 0
    for x in liczby:
        wynik += x
    return wynik

print(powitanie("Ala"), powitanie("Ola", "?"))
a, b = min_max([4, 9, 1, 7])      # rozpakowanie krotki
print("min:", a, "max:", b)
print(dodaj(1, 2, 3, 4, 5))
`,
      },
    ],
  },
  {
    id: 'slowniki',
    title: 'Słowniki, zbiory i krotki',
    intro: [
      'Słownik (`dict`) przechowuje pary klucz → wartość. Idealny do zliczania („ile razy pojawia się każde słowo”). `d.get(k, 0)` zwraca 0, gdy klucza nie ma.',
      'Zbiór (`set`) przechowuje różne wartości – usuwa duplikaty i szybko sprawdza „czy już było”. Krotka (`tuple`) to niezmienna para/trójka, wygodna np. przy sortowaniu po kilku kryteriach.',
    ],
    examples: [
      {
        code: `wystapienia = {}
for litera in "abrakadabra":
    wystapienia[litera] = wystapienia.get(litera, 0) + 1
print(wystapienia)

for klucz, wartosc in wystapienia.items():
    print(klucz, "->", wartosc, end="; ")
print()

# Najczęstsza litera
najczestsza = max(wystapienia, key=wystapienia.get)
print("Najczęstsza:", najczestsza)

liczby = [1, 2, 2, 3, 3, 3]
print(set(liczby), len(set(liczby)))   # ile różnych wartości

para = ("kot", 42)
slowo, wartosc = para                  # rozpakowanie
print(slowo, wartosc)
`,
      },
    ],
  },
  {
    id: 'sortowanie',
    title: 'Sortowanie z kluczem',
    intro: [
      '`sorted(t, key=...)` sortuje według wartości wyliczonej dla każdego elementu. `key` może zwracać krotkę – wtedy sortowanie jest po kilku kryteriach naraz (najpierw pierwszy element krotki, przy remisie drugi…).',
      '`lambda x: ...` to krótka funkcja bez nazwy, najczęściej używana właśnie jako `key`.',
    ],
    examples: [
      {
        code: `slowa = ["kot", "żyrafa", "pies", "mysz", "ul"]
print(sorted(slowa, key=len))                  # po długości
print(sorted(slowa, key=lambda s: (-len(s), s)))   # malejąco po długości, potem alfabetycznie

wyniki = [("Ola", 87), ("Jan", 92), ("Ala", 87)]
ranking = sorted(wyniki, key=lambda p: (-p[1], p[0]))
for imie, punkty in ranking:
    print(imie, punkty)
`,
      },
    ],
  },
  {
    id: 'systemy',
    title: 'Systemy liczbowe',
    intro: [
      'Wbudowane: `bin`, `oct`, `hex` (z przedrostkami `0b`, `0o`, `0x`) i `int(napis, podstawa)` do zamiany na dziesiętny.',
      'Na maturze często trzeba zamianę napisać samodzielnie – dzieląc z resztą przez podstawę (w drugą stronę: schemat Hornera).',
    ],
    examples: [
      {
        code: `print(bin(10), oct(10), hex(255))     # 0b1010 0o12 0xff
print(bin(10)[2:])                    # bez przedrostka -> 1010
print(int("1010", 2), int("ff", 16), int("21", 3))

def na_system(liczba, podstawa):
    if liczba == 0:
        return "0"
    cyfry = "0123456789ABCDEF"
    wynik = ""
    while liczba > 0:
        wynik = cyfry[liczba % podstawa] + wynik
        liczba //= podstawa
    return wynik

def na_dziesietny(napis, podstawa):   # schemat Hornera
    wynik = 0
    for znak in napis:
        wynik = wynik * podstawa + "0123456789ABCDEF".index(znak)
    return wynik

print(na_system(10, 2), na_system(255, 16), na_system(100, 7))
print(na_dziesietny("1010", 2), na_dziesietny("FF", 16))
`,
      },
    ],
  },
  {
    id: 'algorytmy',
    title: 'Klasyczne algorytmy',
    intro: [
      'Te algorytmy pojawiają się na maturze co roku – warto umieć je napisać z pamięci i znać ich złożoność.',
    ],
    examples: [
      {
        code: `def czy_pierwsza(n):           # O(√n)
    if n < 2:
        return False
    i = 2
    while i * i <= n:              # wystarczy sprawdzać do pierwiastka z n
        if n % i == 0:
            return False
        i += 1
    return True

def nwd(a, b):                     # algorytm Euklidesa
    while b != 0:
        a, b = b, a % b
    return a

def nww(a, b):
    return a * b // nwd(a, b)

print([i for i in range(30) if czy_pierwsza(i)])
print("NWD(48, 18) =", nwd(48, 18), " NWW(4, 6) =", nww(4, 6))
`,
      },
      {
        code: `def silnia(n):                    # rekurencja: n! = n · (n-1)!
    if n <= 1:
        return 1
    return n * silnia(n - 1)

def fib(n):                       # iteracyjnie – szybko, O(n)
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

def fib_rek(n):                   # rekurencyjnie – czytelnie, ale O(2^n)
    if n <= 1:
        return n
    return fib_rek(n - 1) + fib_rek(n - 2)

print("5! =", silnia(5))
print([fib(i) for i in range(10)])
print(fib(10), fib_rek(10))
`,
      },
      {
        code: `def sortowanie_babelkowe(t):      # O(n²)
    t = t[:]                      # kopia, żeby nie zmieniać oryginału
    for i in range(len(t) - 1):
        for j in range(len(t) - 1 - i):
            if t[j] > t[j + 1]:
                t[j], t[j + 1] = t[j + 1], t[j]
    return t

def wyszukiwanie_binarne(t, szukana):   # O(log n), lista posortowana!
    lewy, prawy = 0, len(t) - 1
    while lewy <= prawy:
        srodek = (lewy + prawy) // 2
        if t[srodek] == szukana:
            return srodek
        elif t[srodek] < szukana:
            lewy = srodek + 1
        else:
            prawy = srodek - 1
    return -1

print(sortowanie_babelkowe([5, 2, 9, 1, 3]))
print(wyszukiwanie_binarne([1, 3, 5, 7, 9, 11], 7))
`,
      },
    ],
    tips: [
      'W części praktycznej (z plikami) używaj gotowego `sorted()`; własne sortowanie pisz tylko wtedy, gdy zadanie tego wymaga.',
    ],
  },
  {
    id: 'pliki',
    title: 'Praca z plikami',
    intro: [
      'Tryby `open`: `"r"` – odczyt, `"w"` – zapis (nadpisuje plik), `"a"` – dopisywanie na końcu. Konstrukcja `with` sama zamyka plik.',
      'Typowy schemat matury: wczytaj dane z pliku, policz, wypisz wynik (a w części egzaminów – zapisz go do pliku `wyniki*.txt`).',
    ],
    examples: [
      {
        code: `# Przygotowanie przykładowego pliku (na maturze plik już jest)
with open("liczby.txt", "w") as plik:
    plik.write("12 7\\n30 5\\n8 14\\n")

# Wczytanie: każda linia to para liczb
pary = []
with open("liczby.txt") as plik:
    for linia in plik:
        a, b = map(int, linia.split())
        pary.append((a, b))
print(pary)

ile = sum(1 for a, b in pary if a > b)
print("Pary z a > b:", ile)

# Zapis wyniku do pliku
with open("wyniki.txt", "w") as plik:
    print("Zadanie 1:", ile, file=plik)
print(open("wyniki.txt").read())
`,
      },
    ],
    tips: [
      'Linie z pliku kończą się znakiem nowej linii – używaj `linia.strip()` albo `linia.split()`, inaczej `"abc\\n" != "abc"`.',
    ],
  },
  {
    id: 'wejscie',
    title: 'Wczytywanie z klawiatury',
    intro: [
      '`input()` zwraca zawsze napis – liczbę trzeba zamienić przez `int()`. W przykładzie poniżej dane wpisujesz w polu „Wejście”, po jednej linii na każde wywołanie `input()`.',
    ],
    examples: [
      {
        code: `imie = input("Podaj imię: ")
n = int(input("Podaj liczbę: "))
print(f"Cześć {imie}! {n} do kwadratu to {n * n}.")

srednia = 17 / 3
print(f"Średnia wynosi {srednia:.2f}")   # f-string z 2 miejscami po przecinku
`,
        stdin: 'Ala\n7\n',
      },
    ],
  },
];
