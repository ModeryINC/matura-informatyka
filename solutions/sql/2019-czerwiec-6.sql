-- Zadanie 6. „Wymarzony Dom” (czerwiec 2019) – zapytania wzorcowe.
-- 6.1
SELECT oferty.Id_oferty, Imie, Nazwisko
FROM zainteresowanie
JOIN oferty ON oferty.Id_oferty = zainteresowanie.Id_oferty
JOIN agenci ON agenci.Id_agenta = oferty.Id_agenta
GROUP BY oferty.Id_oferty
ORDER BY COUNT(*) DESC
LIMIT 1;
-- 6.2
SELECT Woj, ROUND(AVG(Cena), 2) FROM oferty GROUP BY Woj ORDER BY Woj;
-- 6.3
SELECT Id_oferty, Nazwisko, Imie, Woj, Pow, Cena
FROM oferty JOIN agenci ON agenci.Id_agenta = oferty.Id_agenta
WHERE Status = 'A' AND Id_oferty LIKE '%MT';
-- 6.4
SELECT Imie, Nazwisko FROM agenci
WHERE Id_agenta NOT IN (
  SELECT Id_agenta FROM oferty WHERE YEAR(Data_zglosz) = 2017 AND Status = 'S'
);
-- 6.5
SELECT Id_oferty, Pow, L_pokoi, L_laz, Cena, Imie, Nazwisko
FROM oferty JOIN agenci ON agenci.Id_agenta = oferty.Id_agenta
WHERE Status = 'A' AND Pow > 180 AND L_laz >= 2;
