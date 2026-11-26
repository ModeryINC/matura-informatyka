-- Zadanie 6. Rejestr wykroczeń (maj 2024, stara formuła) – zapytania wzorcowe.
-- 6.1
SELECT Imie, Nazwisko, SUM(Kwota) AS suma
FROM rejestr
JOIN kierowcy ON kierowcy.IdOsoby = rejestr.IdOsoby
JOIN taryfikator ON taryfikator.IdWykroczenia = rejestr.IdWykroczenia
GROUP BY kierowcy.IdOsoby
ORDER BY suma DESC
LIMIT 1;
-- 6.2
SELECT Punkty, COUNT(*)
FROM rejestr JOIN taryfikator ON taryfikator.IdWykroczenia = rejestr.IdWykroczenia
GROUP BY Punkty;
-- 6.3
SELECT MONTH(Data) AS miesiac, SUM(Punkty) AS punkty
FROM rejestr JOIN taryfikator ON taryfikator.IdWykroczenia = rejestr.IdWykroczenia
WHERE rejestr.IdWykroczenia BETWEEN 3 AND 6
GROUP BY miesiac
ORDER BY punkty
LIMIT 1;
-- 6.4
SELECT Imie, Nazwisko, NrRejestracyjny
FROM kierowcy
WHERE IdOsoby NOT IN (SELECT IdOsoby FROM rejestr)
ORDER BY NrRejestracyjny;
-- 6.5
WITH regiony AS (
  SELECT LEFT(NrRejestracyjny, 3) AS region, COUNT(*) AS liczba
  FROM rejestr JOIN kierowcy ON kierowcy.IdOsoby = rejestr.IdOsoby
  WHERE IdWykroczenia = 6
  GROUP BY region
)
SELECT region, liczba FROM regiony WHERE liczba = (SELECT MAX(liczba) FROM regiony);
