-- Zadanie 8. Rejestr wykroczeń (maj 2024) – zapytania wzorcowe.
-- 8.1
SELECT Imie, Nazwisko, SUM(Kwota) AS suma
FROM rejestr
JOIN kierowcy ON kierowcy.IdOsoby = rejestr.IdOsoby
JOIN taryfikator ON taryfikator.IdWykroczenia = rejestr.IdWykroczenia
GROUP BY kierowcy.IdOsoby
ORDER BY suma DESC
LIMIT 1;
-- 8.2
SELECT MONTH(Data) AS miesiac, SUM(Punkty) AS punkty
FROM rejestr JOIN taryfikator ON taryfikator.IdWykroczenia = rejestr.IdWykroczenia
WHERE rejestr.IdWykroczenia BETWEEN 3 AND 6
GROUP BY miesiac
ORDER BY punkty
LIMIT 1;
-- 8.3
SELECT Imie, Nazwisko, NrRejestracyjny
FROM kierowcy
WHERE IdOsoby NOT IN (SELECT IdOsoby FROM rejestr)
ORDER BY NrRejestracyjny;
