-- Zadanie 6. Rozgrywki siatkarskie (czerwiec 2022) – zapytania wzorcowe.
-- 6.1
SELECT COUNT(*) FROM mecze WHERE Sety_wygrane + Sety_przegrane = 5;
-- 6.2
SELECT Miasto, COUNT(*) AS meczow
FROM mecze JOIN kluby ON kluby.Id_klubu = mecze.Id_klubu
GROUP BY Miasto
ORDER BY meczow DESC;
-- 6.3
SELECT Imie, Nazwisko
FROM mecze JOIN sedziowie ON sedziowie.Id_sedziego = mecze.Id_sedziego
GROUP BY sedziowie.Id_sedziego
HAVING COUNT(*) > (SELECT COUNT(*) * 1.0 / COUNT(DISTINCT Id_sedziego) FROM mecze);
-- 6.4
SELECT Imie, Nazwisko FROM sedziowie
WHERE Id_sedziego NOT IN (
  SELECT Id_sedziego FROM mecze JOIN kluby ON kluby.Id_klubu = mecze.Id_klubu
  WHERE Miasto IN ('Licowo', 'Szymbark') AND Data BETWEEN '2019-10-15' AND '2019-12-15'
);
-- 6.5
SELECT Nazwa, Miasto,
  SUM(Sety_wygrane > Sety_przegrane) AS wygrane,
  SUM(Sety_wygrane < Sety_przegrane) AS przegrane
FROM mecze JOIN kluby ON kluby.Id_klubu = mecze.Id_klubu
GROUP BY kluby.Id_klubu
HAVING wygrane >= przegrane;
