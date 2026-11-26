-- Zadanie 6. Koncerty (czerwiec 2021) – zapytania wzorcowe.
-- 6.1
SELECT COUNT(*) FROM koncerty WHERE MONTH(data) = 7;
-- 6.2
WITH artysci AS (
  SELECT miasto, SUM(liczba_artystow) AS liczba
  FROM (SELECT DISTINCT kod_miasta, id_zespolu FROM koncerty) AS k
  JOIN zespoly ON zespoly.id_zespolu = k.id_zespolu
  JOIN miasta ON miasta.kod_miasta = k.kod_miasta
  GROUP BY miasto
)
SELECT miasto FROM artysci WHERE liczba = (SELECT MAX(liczba) FROM artysci);
-- 6.3
SELECT wojewodztwo, ROUND(COUNT(*) * 1.0 / COUNT(DISTINCT miasta.kod_miasta), 2) AS srednia
FROM koncerty JOIN miasta ON miasta.kod_miasta = koncerty.kod_miasta
GROUP BY wojewodztwo
ORDER BY srednia DESC;
-- 6.4
SELECT nazwa FROM zespoly
WHERE id_zespolu NOT IN (
  SELECT id_zespolu FROM koncerty WHERE data BETWEEN '2017-07-20' AND '2017-07-25'
);
-- 6.5
SELECT nazwa,
  SUM(WEEKDAY(data) IN (1, 7)) AS weekendy,
  SUM(WEEKDAY(data) NOT IN (1, 7)) AS powszednie
FROM koncerty JOIN zespoly ON zespoly.id_zespolu = koncerty.id_zespolu
GROUP BY zespoly.id_zespolu
HAVING weekendy > powszednie;
