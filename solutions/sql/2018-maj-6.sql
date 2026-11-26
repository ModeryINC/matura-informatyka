-- Zadanie 6. Centrum danych (maj 2018) – zapytania wzorcowe.
-- 6.1
SELECT Pojemnosc_dysku, COUNT(*) AS komputerow
FROM komputery
GROUP BY Pojemnosc_dysku
ORDER BY komputerow DESC
LIMIT 10;
-- 6.2
SELECT komputery.Numer_komputera, COUNT(*)
FROM naprawy
JOIN awarie ON awarie.Numer_zgloszenia = naprawy.Numer_zgloszenia
JOIN komputery ON komputery.Numer_komputera = awarie.Numer_komputera
WHERE Sekcja = 'A' AND Rodzaj = 'wymiana'
GROUP BY komputery.Numer_komputera
HAVING COUNT(*) >= 10;
-- 6.3
SELECT date(Czas_awarii) AS dzien, Sekcja
FROM awarie JOIN komputery ON komputery.Numer_komputera = awarie.Numer_komputera
GROUP BY dzien, Sekcja
HAVING COUNT(DISTINCT awarie.Numer_komputera) =
  (SELECT COUNT(*) FROM komputery AS k WHERE k.Sekcja = komputery.Sekcja);
-- 6.4
SELECT awarie.Numer_zgloszenia, Czas_awarii, MAX(Czas_naprawy)
FROM awarie JOIN naprawy ON naprawy.Numer_zgloszenia = awarie.Numer_zgloszenia
GROUP BY awarie.Numer_zgloszenia
ORDER BY julianday(MAX(Czas_naprawy)) - julianday(Czas_awarii) DESC
LIMIT 1;
-- 6.5
SELECT COUNT(*) FROM komputery
WHERE Numer_komputera NOT IN (SELECT Numer_komputera FROM awarie WHERE Priorytet >= 8);
