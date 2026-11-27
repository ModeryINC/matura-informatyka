/**
 * Treść podstrony „Podstawy teorii”: wiedza ogólna potrzebna w zadaniach testowych
 * (systemy liczbowe, sieci, kryptografia, grafika, prawo…), z interaktywnymi
 * narzędziami tam, gdzie można coś policzyć.
 */
import type { TheoryToolId } from '../components/TheoryTools';

export interface TheoryTable {
  head: string[];
  rows: string[][];
}

export interface TheoryBasicsSection {
  id: string;
  title: string;
  /** Akapity; `kod` w odwrotnych apostrofach, **pogrubienie**. */
  intro: string[];
  tables?: TheoryTable[];
  tools?: TheoryToolId[];
  tips?: string[];
}

export const THEORY_BASICS: TheoryBasicsSection[] = [
  {
    id: 'systemy',
    title: 'Systemy liczbowe',
    intro: [
      'W systemie pozycyjnym o podstawie `p` cyfra na pozycji `k` (licząc od 0 od prawej) ma wagę `pᵏ`. Na przykład 1011₂ = 1·8 + 0·4 + 1·2 + 1·1 = 11, a BA₁₆ = 11·16 + 10 = 186. W systemie szesnastkowym cyfry 10–15 to litery A–F.',
      'Zamiana z dziesiętnego: dzielimy liczbę przez podstawę, zapisujemy reszty i czytamy je od ostatniej do pierwszej. Zamiana z innego systemu na dziesiętny: suma cyfr razy potęgi podstawy (albo schemat Hornera).',
      '**Skróty między 2, 4, 8 i 16:** jedna cyfra czwórkowa to 2 bity, ósemkowa – 3 bity, szesnastkowa – 4 bity. Liczbę dwójkową dzielimy od prawej na grupy: 10111010₂ = 1011 1010 = BA₁₆ = 10 111 010 = 272₈ = 10 11 10 10 = 2322₄.',
      'Działania pisemne (dodawanie, odejmowanie, mnożenie) wykonuje się jak w dziesiątkowym, tylko przeniesienie następuje przy podstawie: w dwójkowym 1 + 1 = 10₂. W zadaniach testowych najprościej zamienić wszystko na dziesiętny, policzyć i porównać.',
    ],
    tools: ['liczby'],
    tips: [
      'Liczba k-cyfrowa w systemie dwójkowym (z jedynką na początku) leży w przedziale [2ᵏ⁻¹, 2ᵏ). Ma więc ⌈k/4⌉ cyfr szesnastkowych i ⌈k/3⌉ ósemkowych.',
      'Liczba złożona z samych jedynek: 11…1₂ (k jedynek) = 2ᵏ − 1, np. 1111 1111₂ = 255 = FF₁₆.',
    ],
  },
  {
    id: 'liczby-ujemne',
    title: 'Liczby ujemne i ułamki w komputerze',
    intro: [
      '**Kod U2** (uzupełnień do dwóch) to standardowy zapis liczb całkowitych ze znakiem: najstarszy bit ma wagę ujemną −2ⁿ⁻¹. Na n bitach zapiszemy liczby od −2ⁿ⁻¹ do 2ⁿ⁻¹ − 1 (na 8 bitach: −128…127).',
      'Liczbę przeciwną otrzymamy, negując wszystkie bity i dodając 1: 5 = 00000101, −5 = 11111010 + 1 = 11111011. Dodawanie w U2 działa tak samo jak dla liczb bez znaku – wynik wychodzący poza zakres to **przepełnienie**.',
      '**Zapis zmiennoprzecinkowy** (IEEE 754) to znak, wykładnik i mantysa: x = (−1)ᶻ · m · 2ᶜ. Większość ułamków dziesiętnych (np. 0,1) nie ma skończonego rozwinięcia dwójkowego, dlatego w programach 0.1 + 0.2 daje 0.30000000000000004 – liczby rzeczywiste porównujemy z tolerancją.',
      'Ułamek dziesiętny zamieniamy na dwójkowy, mnożąc go wielokrotnie przez 2 i zapisując części całkowite: 0,625 → 1,25 → 0,5 → 1,0, czyli 0,101₂.',
    ],
    tools: ['u2'],
  },
  {
    id: 'informacja',
    title: 'Jednostki informacji i kodowanie znaków',
    intro: [
      'Bit to 0 albo 1, bajt to 8 bitów. Za pomocą n bitów zakodujemy 2ⁿ różnych wartości, a do zakodowania k symboli potrzeba ⌈log₂ k⌉ bitów (np. 5 znaków – 3 bity, bo 2² = 4 < 5 ≤ 8 = 2³).',
      'Przedrostki dziesiętne (SI): 1 kB = 1000 B, 1 MB = 10⁶ B. Przedrostki dwójkowe: 1 KiB = 1024 B, 1 MiB = 1024² B. Prędkość łącza podaje się zwykle w bitach na sekundę (Mb/s), a rozmiar pliku w bajtach – 100 Mb/s to ok. 12,5 MB/s.',
      '**ASCII** koduje 128 znaków na 7 bitach (litery łacińskie, cyfry, znaki sterujące; „A” = 65, „a” = 97, „0” = 48). **Unicode** obejmuje znaki wszystkich alfabetów; najpopularniejsze kodowanie **UTF-8** zapisuje znak na 1–4 bajtach (polskie litery – 2 bajty). Starsze polskie kodowania to Windows-1250 i ISO 8859-2.',
    ],
    tables: [
      {
        head: ['Bity', 'Liczba wartości', 'Przykład'],
        rows: [
          ['1', '2', 'tak / nie'],
          ['3', '8', 'cyfra ósemkowa'],
          ['4', '16', 'cyfra szesnastkowa'],
          ['8', '256', 'bajt, znak ASCII rozszerzony'],
          ['24', '16 777 216', 'kolor RGB (3 × 8 bitów)'],
          ['32', 'ok. 4,3 mld', 'adres IPv4'],
        ],
      },
    ],
  },
  {
    id: 'logika',
    title: 'Logika i bramki',
    intro: [
      'Podstawowe operacje logiczne: **NOT** (negacja), **AND** (koniunkcja – 1 tylko gdy oba argumenty są 1), **OR** (alternatywa – 1 gdy choć jeden jest 1), **XOR** (alternatywa wykluczająca – 1 gdy argumenty są różne). NAND i NOR to zanegowane AND i OR.',
      'Prawa De Morgana: `not (a and b) = (not a) or (not b)` oraz `not (a or b) = (not a) and (not b)`. Wyrażenie `((not a) and b) or (a and (not b))` to XOR, a jego negacja – równoważność (1, gdy a = b).',
      'W programach warunki są obliczane **leniwie**: w `a and b` drugi argument nie jest sprawdzany, gdy `a` jest fałszem – przydaje się np. w `i < len(t) and t[i] > 0`.',
    ],
    tools: ['bramki'],
    tables: [
      {
        head: ['a', 'b', 'a AND b', 'a OR b', 'a XOR b', 'a NAND b'],
        rows: [
          ['0', '0', '0', '0', '0', '1'],
          ['0', '1', '0', '1', '1', '1'],
          ['1', '0', '0', '1', '1', '1'],
          ['1', '1', '1', '1', '0', '0'],
        ],
      },
    ],
  },
  {
    id: 'adresacja',
    title: 'Adresacja IP',
    intro: [
      'Adres **IPv4** ma 32 bity zapisane jako cztery liczby 0–255 (np. 192.168.10.65), adres **IPv6** – 128 bitów zapisanych szesnastkowo w ośmiu grupach (np. 2001:db8::1).',
      '**Maska** wskazuje, które bity adresu to część sieci (jedynki), a które – część hosta (zera). Maska 255.255.255.0 to /24: pierwsze 24 bity to sieć. Dwa komputery są w tej samej sieci, gdy mają taki sam adres sieci.',
      '**Adres sieci** = adres AND maska (zera w części hosta), **adres rozgłoszeniowy** (broadcast) – same jedynki w części hosta. Hostów jest 2³²⁻ᵖʳᵉᶠⁱᵏˢ − 2 (bez adresu sieci i rozgłoszeniowego): dla /24 to 254.',
      'Adresy prywatne (niewidoczne w internecie, za routerem z NAT): 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. Adres 127.0.0.1 to własny komputer (localhost).',
    ],
    tools: ['podsieci'],
    tips: [
      'Maska /16 = 255.255.0.0: komputery 196.122.128.0 i 196.122.129.0 są w tej samej sieci 196.122.0.0, ale przy masce /24 już nie (sieci 196.122.128.0 i 196.122.129.0).',
    ],
  },
  {
    id: 'sieci',
    title: 'Sieci komputerowe: urządzenia i protokoły',
    intro: [
      '**Router** łączy różne sieci i wybiera trasę pakietów na podstawie adresu IP. **Przełącznik (switch)** łączy urządzenia w jednej sieci lokalnej i przesyła ramki tylko do właściwego portu (na podstawie adresu MAC). **Koncentrator (hub)** rozsyła dane do wszystkich portów. **Punkt dostępowy** to most między siecią przewodową a Wi-Fi.',
      'Model **TCP/IP** ma warstwy: dostępu do sieci (Ethernet, Wi-Fi, adresy MAC), internetu (IP), transportową (TCP – połączeniowy, niezawodny; UDP – szybszy, bez potwierdzeń) i aplikacji (HTTP, DNS…). Usługi są rozróżniane numerami **portów**.',
      '**DNS** zamienia nazwy domen na adresy IP (to rozproszona, hierarchiczna baza – nie jedna centralna); jednemu adresowi IP może odpowiadać wiele nazw. **DHCP** automatycznie przydziela komputerom adres IP, maskę, bramę i adresy serwerów DNS.',
    ],
    tables: [
      {
        head: ['Protokół', 'Do czego służy', 'Port'],
        rows: [
          ['HTTP / HTTPS', 'strony WWW (HTTPS – szyfrowany TLS)', '80 / 443'],
          ['FTP', 'przesyłanie plików', '21'],
          ['SSH', 'zdalny, szyfrowany dostęp do terminala', '22'],
          ['SMTP', 'wysyłanie poczty', '25 (587)'],
          ['POP3 / IMAP', 'odbieranie poczty z serwera', '110 / 143'],
          ['DNS', 'nazwy domen → adresy IP', '53'],
          ['DHCP', 'automatyczna konfiguracja adresów IP', '67 / 68'],
        ],
      },
    ],
  },
  {
    id: 'www',
    title: 'Strony WWW',
    intro: [
      '**HTML** opisuje strukturę i treść strony (nagłówki, akapity, linki, obrazy), **CSS** – jej wygląd (kolory, czcionki, układ); CSS powstał, by oddzielić strukturę dokumentu od formy prezentacji. **JavaScript** dodaje interakcję.',
      'Kod **po stronie klienta** (HTML, CSS, JavaScript) wykonuje przeglądarka, a kod **po stronie serwera** (np. PHP, Python) – serwer, który odsyła gotowy HTML. Skrypt JavaScript może w tle pobierać dodatkowe dane z serwera.',
      'Kolory w CSS zapisuje się m.in. jako `#RRGGBB` – po dwie cyfry szesnastkowe na składową czerwoną, zieloną i niebieską (00–FF, czyli 0–255) – albo `rgb(r, g, b)`. `#FFFFFF` to biel, `#000000` – czerń.',
    ],
    tools: ['kolory'],
  },
  {
    id: 'grafika',
    title: 'Grafika i multimedia',
    intro: [
      '**Grafika rastrowa** (bitmapowa) to siatka pikseli – przy powiększaniu widać „schodki”. **Grafika wektorowa** to opis kształtów (linie, krzywe, wypełnienia) – można ją skalować bez utraty jakości; formaty: SVG, EPS, AI, CDR.',
      '**RGB** to model addytywny (światło: ekrany), kolory podstawowe czerwony, zielony, niebieski; suma daje biel. **CMYK** to model subtraktywny (druk: Cyan, Magenta, Yellow, black), nałożenie żółtego i purpurowego daje czerwony. Materiały do druku przygotowuje się w CMYK.',
      'Kompresja **bezstratna** pozwala odtworzyć dokładnie oryginał (PNG, GIF, ZIP, FLAC), **stratna** usuwa mniej istotne szczegóły w zamian za mniejszy plik (JPG, MP3, MP4). GIF ma najwyżej 256 kolorów (paleta) i obsługuje animację oraz przezroczystość; JPG nie obsługuje przezroczystości; PNG obsługuje przezroczystość (kanał alfa).',
      '**Rozdzielczość** to liczba pikseli obrazu (np. 1920 × 1080), **głębia koloru** – liczba bitów na piksel (24 bity = 16,7 mln kolorów). Rozmiar bitmapy bez kompresji = szerokość · wysokość · głębia / 8 bajtów.',
    ],
    tools: ['obraz'],
    tables: [
      {
        head: ['Format', 'Rodzaj', 'Uwagi'],
        rows: [
          ['BMP', 'raster', 'zwykle bez kompresji'],
          ['PNG', 'raster', 'kompresja bezstratna, przezroczystość'],
          ['JPG / JPEG', 'raster', 'kompresja stratna, zdjęcia, bez przezroczystości'],
          ['GIF', 'raster', 'do 256 kolorów, animacje, przezroczystość'],
          ['TIFF', 'raster', 'druk, skany, wiele opcji kompresji'],
          ['SVG', 'wektor', 'oparty na XML, w przeglądarkach'],
          [
            'MP3, WAV, MIDI, OGG',
            'dźwięk',
            'MP3 stratny, WAV zwykle bez kompresji, MIDI – nuty, nie nagranie',
          ],
          ['AVI, MOV, MPEG, MP4', 'wideo', 'kontenery / formaty filmów'],
        ],
      },
    ],
  },
  {
    id: 'kryptografia',
    title: 'Szyfrowanie',
    intro: [
      '**Szyfry klasyczne:** podstawieniowe zamieniają litery na inne (szyfr Cezara – przesunięcie w alfabecie o stałą liczbę pozycji, szyfr Vigenère’a – przesunięcie zależne od litery klucza), przestawieniowe zmieniają kolejność liter (np. szyfr kolumnowy, płotkowy).',
      '**Szyfrowanie symetryczne** używa jednego, tajnego klucza do szyfrowania i odszyfrowania (AES, DES, szyfr Cezara). Jest szybkie, ale obie strony muszą bezpiecznie wymienić klucz.',
      '**Szyfrowanie asymetryczne** (RSA) używa pary kluczy: **publicznego** (jawnego) i **prywatnego** (tajnego). Wiadomość do osoby A szyfruje się kluczem publicznym A, a odszyfrować może tylko A swoim kluczem prywatnym. Bezpieczeństwo RSA opiera się na trudności rozkładu dużej liczby n = p · q na czynniki pierwsze.',
      '**Podpis elektroniczny** tworzy się kluczem prywatnym nadawcy (ze skrótu dokumentu), a weryfikuje jego kluczem publicznym. Potwierdza autentyczność nadawcy i integralność dokumentu, ale sam nie szyfruje treści i nie chroni przed utratą danych. **Funkcja skrótu** (SHA-256) daje krótki „odcisk” danych – nie da się z niego odtworzyć danych; tak przechowuje się hasła.',
    ],
    tools: ['cezar', 'rsa'],
    tips: [
      'HTTPS łączy oba rodzaje: asymetrycznie (certyfikat serwera) uzgadnia się klucz sesji, a dane szyfruje się już symetrycznie.',
    ],
  },
  {
    id: 'bezpieczenstwo',
    title: 'Bezpieczeństwo',
    intro: [
      '**Złośliwe oprogramowanie:** wirus dołącza się do plików i potrzebuje ich uruchomienia, robak (worm) rozprzestrzenia się sam przez sieć, koń trojański udaje użyteczny program, **keylogger** przechwytuje naciśnięcia klawiszy, ransomware szyfruje dane i żąda okupu, spyware szpieguje użytkownika.',
      '**Phishing** to podszywanie się (e-mail, SMS, fałszywa strona) w celu wyłudzenia haseł lub danych karty. Atak DoS/DDoS zalewa serwer żądaniami, aby przestał działać.',
      '**Uwierzytelnianie dwuskładnikowe** (2FA) łączy dwie kategorie: coś, co wiesz (hasło), coś, co masz (telefon, klucz U2F), coś, czym jesteś (odcisk palca). Nie wymaga kamery ani mikrofonu i znacząco utrudnia przejęcie konta, ale nie daje absolutnej gwarancji.',
      'Dobre praktyki: długie, unikalne hasła (menedżer haseł), aktualizacje systemu, kopie zapasowe (zasada 3-2-1), zapora sieciowa (firewall) i program antywirusowy, ostrożność przy załącznikach i linkach.',
    ],
  },
  {
    id: 'bazy',
    title: 'Bazy danych – pojęcia',
    intro: [
      'Relacyjna baza danych to zbiór **tabel** (relacji); wiersz to **rekord**, kolumna – **pole** (atrybut) o określonym typie. **Klucz główny** jednoznacznie identyfikuje rekord, **klucz obcy** wskazuje klucz główny w innej tabeli.',
      'Relacje między tabelami: **jeden do jednego**, **jeden do wielu** (jeden klient – wiele zamówień; klucz obcy po stronie „wielu”) i **wiele do wielu** (realizowana przez tabelę pośredniczącą, np. uczniowie – zajęcia – zapisy).',
      'Polecenia SQL: zapytania `SELECT` (z `WHERE`, `GROUP BY`, `HAVING`, `ORDER BY`, `JOIN`), modyfikacja danych `INSERT`, `UPDATE`, `DELETE`, struktura `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`. `ORDER BY` sortuje domyślnie rosnąco (niemalejąco – mogą być równe wartości), `DESC` – malejąco.',
      '**Normalizacja** usuwa powtórzenia danych (np. nazwa miasta zapisana raz w osobnej tabeli zamiast przy każdym kliencie), co zapobiega niespójnościom przy zmianach.',
    ],
    tips: ['Więcej przykładów z uruchamianymi zapytaniami jest w podstawach SQL.'],
  },
  {
    id: 'struktury',
    title: 'Struktury danych',
    intro: [
      '**Tablica** – elementy w ciągłym bloku, dostęp do i-tego elementu w czasie stałym. **Lista** (dowiązaniowa) – elementy połączone wskaźnikami, łatwe wstawianie, ale dostęp sekwencyjny.',
      '**Stos** (LIFO – last in, first out) – elementy dokładamy i zdejmujemy z wierzchołka; dostępny jest tylko ostatnio dodany element. Zastosowania: wywołania funkcji (rekurencja), cofanie operacji, obliczanie wyrażeń w Odwrotnej Notacji Polskiej (ONP).',
      '**Kolejka** (FIFO – first in, first out) – elementy dodajemy na koniec, pobieramy z początku (bufor drukarki, przeszukiwanie wszerz). **Słownik** (tablica asocjacyjna, `dict` w Pythonie) przechowuje pary klucz–wartość z szybkim wyszukiwaniem po kluczu.',
      '**Drzewo** – hierarchia węzłów (korzeń, dzieci, liście); drzewo binarne ma najwyżej dwoje dzieci w węźle. **Graf** – wierzchołki i krawędzie (np. sieć dróg); przeszukuje się go wszerz (BFS, kolejka) lub w głąb (DFS, stos).',
      '**ONP:** operator stoi za argumentami, nie trzeba nawiasów: `(2 + 3) · 4` to `2 3 + 4 ·`. Obliczanie: liczby wkładamy na stos, a operator zdejmuje dwie ostatnie liczby i odkłada wynik.',
    ],
  },
  {
    id: 'zlozonosc',
    title: 'Złożoność obliczeniowa',
    intro: [
      'Złożoność czasowa mówi, jak rośnie liczba operacji algorytmu wraz z rozmiarem danych n (bez stałych współczynników). Złożoność pamięciowa – jak rośnie zużycie pamięci.',
      'Pętla wykonana n razy to złożoność **liniowa**, dwie zagnieżdżone pętle po n – **kwadratowa** (także pętla wewnętrzna od i do n: n(n+1)/2 ≈ n²/2 wykonań). Dzielenie problemu na pół w każdym kroku (wyszukiwanie binarne) daje **logarytmiczną**.',
      'Złożoność **wykładnicza** (np. naiwna rekurencja f(n) = f(n−1) + f(n−2) albo funkcja wywołująca siebie dla wszystkich mniejszych argumentów) sprawia, że już dla n ≈ 50–100 obliczenia trwają latami.',
    ],
    tables: [
      {
        head: ['Złożoność', 'Nazwa', 'Przykład', 'n = 1000'],
        rows: [
          ['O(1)', 'stała', 'dostęp do t[i]', '1'],
          ['O(log n)', 'logarytmiczna', 'wyszukiwanie binarne', '≈ 10'],
          ['O(n)', 'liniowa', 'wyszukiwanie liniowe, suma', '1000'],
          ['O(n log n)', 'liniowo-logarytmiczna', 'sortowanie przez scalanie', '≈ 10 000'],
          ['O(n²)', 'kwadratowa', 'sortowanie bąbelkowe', '1 000 000'],
          ['O(2ⁿ)', 'wykładnicza', 'naiwny Fibonacci, wszystkie podzbiory', '≈ 10³⁰¹'],
        ],
      },
    ],
  },
  {
    id: 'prawo',
    title: 'Prawo autorskie i licencje',
    intro: [
      'Prawo autorskie chroni utwór od chwili jego ustalenia (zapisania), **bez żadnych formalności** (rejestracji, znaku ©). Programy komputerowe są utworami chronionymi prawem autorskim. Autorskie prawa osobiste (autorstwo) są niezbywalne, majątkowe (zarabianie na utworze) można przenieść.',
      '**Dozwolony użytek** pozwala m.in. korzystać z utworu na własny użytek osobisty i przytaczać fragmenty w ramach cytatu (z podaniem autora i źródła). Przerobienie cudzego tekstu „swoimi słowami” bez wskazania źródła to plagiat.',
      'Treści Wikipedii są na licencji **Creative Commons BY-SA**: można je kopiować i zmieniać, także komercyjnie, pod warunkiem podania autora i udostępnienia na tej samej licencji. Własny tekst można dodać do Wikipedii, godząc się na tę licencję.',
    ],
    tables: [
      {
        head: ['Licencja / rodzaj', 'Co wolno'],
        rows: [
          ['freeware', 'używać za darmo, bez dostępu do kodu i zwykle bez modyfikacji'],
          ['shareware', 'używać przez okres próbny lub w ograniczonej wersji, potem zapłacić'],
          [
            'open source (np. GPL, MIT)',
            'używać, czytać i zmieniać kod; GPL wymaga udostępnienia zmian na tej samej licencji',
          ],
          [
            'public domain',
            'wszystko – prawa majątkowe wygasły (70 lat po śmierci autora) lub autor się ich zrzekł',
          ],
          [
            'licencja komercyjna (OEM, BOX)',
            'używać zgodnie z umową, zwykle na określonej liczbie urządzeń',
          ],
        ],
      },
    ],
    tips: [
      'Dane osobowe chroni RODO: przetwarzanie wymaga podstawy prawnej (np. zgody), a osoba ma prawo wglądu, poprawienia i usunięcia swoich danych.',
    ],
  },
  {
    id: 'sprzet',
    title: 'Sprzęt i system operacyjny',
    intro: [
      '**Procesor** (CPU) wykonuje rozkazy programu; ma rejestry i pamięć podręczną (cache). **Pamięć RAM** jest szybka, ale ulotna (traci dane po wyłączeniu), **ROM / flash** – nieulotna. Dane trwale przechowują dyski HDD (magnetyczne) i SSD (półprzewodnikowe, szybsze).',
      'Złącza: **USB** (urządzenia peryferyjne: klawiatura, mysz, pendrive, drukarka), **HDMI** i DisplayPort (obraz i dźwięk do monitora), RJ-45 (sieć Ethernet). FTP czy PHP to nie złącza, tylko protokół i język programowania.',
      '**System operacyjny** zarządza procesorem, pamięcią, urządzeniami i plikami oraz uruchamia programy. Systemy plików to np. NTFS, FAT32 (pliki do 4 GB), exFAT, ext4. Kompilator tłumaczy cały program na kod maszynowy przed uruchomieniem, interpreter (np. Python) wykonuje go na bieżąco.',
    ],
  },
];
