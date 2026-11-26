-- Zadanie 7. Gry planszowe (maj 2023) – zapytania wzorcowe.
-- 7.1
SELECT nazwa, COUNT(*) AS ocen
FROM oceny JOIN gry ON gry.id_gry = oceny.id_gry
GROUP BY gry.id_gry
ORDER BY ocen DESC
LIMIT 1;
-- 7.2
SELECT nazwa, ROUND(AVG(ocena), 2)
FROM oceny JOIN gry ON gry.id_gry = oceny.id_gry
WHERE kategoria = 'imprezowa'
GROUP BY gry.id_gry;
-- 7.3
SELECT COUNT(DISTINCT id_gracza)
FROM oceny
WHERE id_gracza NOT IN (SELECT id_gracza FROM oceny WHERE stan = 'posiada');
-- 7.4
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
