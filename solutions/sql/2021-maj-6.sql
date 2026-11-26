-- Zadanie 6. Bitwa (maj 2021) – zapytania wzorcowe.
-- 6.1
SELECT kraj, COUNT(*) AS graczy
FROM gracze
WHERE YEAR(data_dolaczenia) = 2018
GROUP BY kraj
ORDER BY graczy DESC
LIMIT 5;
-- 6.2
SELECT klasy.nazwa, SUM(strzal)
FROM jednostki JOIN klasy ON klasy.nazwa = jednostki.nazwa
WHERE klasy.nazwa LIKE '%elf%'
GROUP BY klasy.nazwa;
-- 6.3
SELECT id_gracza FROM gracze
WHERE id_gracza NOT IN (SELECT id_gracza FROM jednostki WHERE nazwa = 'artylerzysta')
ORDER BY id_gracza;
-- 6.4
SELECT klasy.nazwa, COUNT(*)
FROM jednostki JOIN klasy ON klasy.nazwa = jednostki.nazwa
WHERE ABS(lok_x - 100) + ABS(lok_y - 100) <= szybkosc
GROUP BY klasy.nazwa;
-- 6.5
WITH bitwy AS (
  SELECT lok_x, lok_y FROM jednostki
  GROUP BY lok_x, lok_y
  HAVING COUNT(DISTINCT id_gracza) > 1
)
SELECT
  (SELECT COUNT(*) FROM bitwy),
  (SELECT COUNT(*) FROM bitwy
   WHERE EXISTS (
     SELECT 1 FROM jednostki JOIN gracze ON gracze.id_gracza = jednostki.id_gracza
     WHERE kraj = 'Polska' AND jednostki.lok_x = bitwy.lok_x AND jednostki.lok_y = bitwy.lok_y
   ));
