-- Zadanie 6. Wypożyczalnia samochodów (czerwiec 2018) – zapytania wzorcowe.
-- Klucz do 6.4 ucina tabelę na końcu strony (są w nim tylko 3 z 5 miejscowości);
-- pełne zestawienie wynika z danych.
-- 6.1
WITH zestawienie AS (
  SELECT Nazwisko, Imie, Nr_rej,
    julianday(Zwrot) - julianday(Wypozyczenie) AS doby,
    (julianday(Zwrot) - julianday(Wypozyczenie)) * Cena AS naleznosc
  FROM wypozyczenia
  JOIN klienci ON klienci.Nr_klienta = wypozyczenia.Nr_klienta
  JOIN samochody ON samochody.Nr_ew = wypozyczenia.Nr_ew
  JOIN ceny_za_dobe ON Klasa = LEFT(Nr_firmowy, 1)
)
SELECT * FROM (SELECT * FROM zestawienie ORDER BY Nazwisko, Imie, Nr_rej LIMIT 1)
UNION ALL
SELECT * FROM (SELECT * FROM zestawienie ORDER BY Nazwisko DESC, Imie DESC, Nr_rej DESC LIMIT 1);
-- 6.2
SELECT LEFT(Nr_firmowy, 1) AS klasa, COUNT(*)
FROM wypozyczenia JOIN samochody ON samochody.Nr_ew = wypozyczenia.Nr_ew
GROUP BY klasa;
-- 6.3
WITH ile AS (
  SELECT Imie, Nazwisko, COUNT(*) AS liczba
  FROM wypozyczenia JOIN klienci ON klienci.Nr_klienta = wypozyczenia.Nr_klienta
  GROUP BY klienci.Nr_klienta
)
SELECT * FROM ile WHERE liczba = (SELECT MAX(liczba) FROM ile);
-- 6.4
SELECT LEFT(Nr_firmowy, 1) AS klasa, Miejscowosc, COUNT(*)
FROM samochody
WHERE Nr_ew NOT IN (SELECT Nr_ew FROM wypozyczenia)
GROUP BY klasa, Miejscowosc;
-- 6.5
SELECT COUNT(*) FROM klienci WHERE Nr_klienta NOT IN (SELECT Nr_klienta FROM wypozyczenia);
