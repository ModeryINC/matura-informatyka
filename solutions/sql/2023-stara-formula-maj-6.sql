-- Zadanie 6. Gry planszowe (maj 2023, stara formuła) – zapytania wzorcowe.
-- 6.1
SELECT nazwa, COUNT(*) AS ocen
FROM oceny JOIN gry ON gry.id_gry = oceny.id_gry
GROUP BY gry.id_gry
ORDER BY ocen DESC
LIMIT 1;
-- 6.2
SELECT nazwa, ROUND(AVG(ocena), 2)
FROM oceny JOIN gry ON gry.id_gry = oceny.id_gry
WHERE kategoria = 'imprezowa'
GROUP BY gry.id_gry;
-- 6.3
SELECT imie, nazwisko
FROM gracze
WHERE id_gracza IN (
  SELECT id_gracza FROM oceny JOIN gry ON gry.id_gry = oceny.id_gry
  WHERE stan = 'posiada' AND kategoria = 'imprezowa'
) AND id_gracza NOT IN (
  SELECT id_gracza FROM oceny JOIN gry ON gry.id_gry = oceny.id_gry
  WHERE stan = 'posiada' AND kategoria <> 'imprezowa'
)
ORDER BY nazwisko;
-- 6.4
SELECT COUNT(DISTINCT id_gracza)
FROM oceny
WHERE id_gracza NOT IN (SELECT id_gracza FROM oceny WHERE stan = 'posiada');
-- 6.5
WITH liczby AS (
  SELECT CASE WHEN wiek <= 19 THEN 'juniorzy' WHEN wiek <= 49 THEN 'seniorzy' ELSE 'weterani' END AS grupa,
    nazwa, COUNT(*) AS ocen
  FROM oceny
  JOIN gracze ON gracze.id_gracza = oceny.id_gracza
  JOIN gry ON gry.id_gry = oceny.id_gry
  GROUP BY grupa, gry.id_gry
)
SELECT grupa, nazwa, ocen FROM liczby
WHERE ocen = (SELECT MAX(ocen) FROM liczby AS l WHERE l.grupa = liczby.grupa);
