-- Zadanie 7. Poszukiwanie wody na Marsie (maj 2025) – zapytania wzorcowe.
-- 7.1
SELECT nazwa_obszaru, SUM(ilosc) AS woda
FROM pomiary JOIN obszary ON obszary.kod_obszaru = pomiary.kod_obszaru
WHERE glebokosc <= 100
GROUP BY nazwa_obszaru
ORDER BY woda DESC
LIMIT 1;
-- 7.2
SELECT nazwa_lazika, MIN(data_pomiaru), MAX(data_pomiaru)
FROM pomiary JOIN laziki ON laziki.nr_lazika = pomiary.nr_lazika
GROUP BY laziki.nr_lazika
ORDER BY julianday(MAX(data_pomiaru)) - julianday(MIN(data_pomiaru)) DESC
LIMIT 1;
-- 7.3
SELECT nazwa_obszaru FROM obszary
WHERE kod_obszaru NOT IN (
  SELECT kod_obszaru
  FROM pomiary JOIN laziki ON laziki.nr_lazika = pomiary.nr_lazika
  WHERE YEAR(data_pomiaru) = rok_wyslania
);
-- 7.4
SELECT nazwa_lazika
FROM laziki JOIN pomiary ON laziki.nr_lazika = pomiary.nr_lazika
WHERE wsp_ladowania LIKE '%S,%'
GROUP BY laziki.nr_lazika
HAVING SUM(wspolrzedne LIKE '%N,%') > 0 AND SUM(wspolrzedne LIKE '%S,%') > 0;
