-- Zadanie 6. Wyścigi kolarskie (próbna CKE, marzec 2021) – zapytania wzorcowe.
-- W kluczu do 6.1 jest „Chris Froom”; w danych zawodnik nazywa się Froome.
-- 6.1
SELECT imie, nazwisko, czas
FROM czasy
JOIN startujacy ON startujacy.id_startu = czasy.id_startu
JOIN zawodnicy ON zawodnicy.id_zawodnika = startujacy.id_zawodnika
ORDER BY czas
LIMIT 1;
-- 6.2
SELECT imie, nazwisko, COUNT(*) AS wyscigow
FROM startujacy JOIN zawodnicy ON zawodnicy.id_zawodnika = startujacy.id_zawodnika
WHERE obywatel_kraju = 'Polska'
GROUP BY zawodnicy.id_zawodnika
ORDER BY wyscigow DESC
LIMIT 1;
-- 6.3
WITH wiek AS (
  SELECT rok, imie, nazwisko, rok - YEAR(data) AS lat
  FROM startujacy JOIN zawodnicy ON zawodnicy.id_zawodnika = startujacy.id_zawodnika
)
SELECT rok, imie, nazwisko FROM wiek
WHERE lat = (SELECT MIN(lat) FROM wiek AS w WHERE w.rok = wiek.rok)
ORDER BY rok;
-- 6.4
SELECT rok, COUNT(*) AS nie_ukonczylo
FROM startujacy
WHERE id_startu NOT IN (SELECT id_startu FROM czasy)
GROUP BY rok
ORDER BY nie_ukonczylo DESC
LIMIT 1;
-- 6.5
SELECT rok, COUNT(*)
FROM (
  SELECT rok, kod_grupy FROM startujacy
  GROUP BY rok, kod_grupy
  HAVING COUNT(DISTINCT obywatel_kraju) = 1
)
GROUP BY rok;
-- 6.6
SELECT imie, nazwisko, group_concat(DISTINCT obywatel_kraju)
FROM startujacy JOIN zawodnicy ON zawodnicy.id_zawodnika = startujacy.id_zawodnika
GROUP BY zawodnicy.id_zawodnika
HAVING COUNT(DISTINCT obywatel_kraju) > 1;
