-- Zadanie 8. Oceny (czerwiec 2026) – zapytania wzorcowe.
-- 8.1
SELECT Plec, ROUND(AVG(Ocena), 2)
FROM oceny
JOIN uczniowie ON uczniowie.Id_Ucznia = oceny.Id_Ucznia
JOIN nauczyciele ON nauczyciele.Id_Naucz = oceny.Id_Naucz
WHERE Przedmiot = 'matematyka'
GROUP BY Plec;
-- 8.2
SELECT DISTINCT Id_Naucz FROM oceny
WHERE Id_Naucz NOT IN (
  SELECT Id_Naucz FROM oceny
  WHERE Ocena = 1 AND Data BETWEEN '2023-12-01' AND '2023-12-31'
);
-- 8.3
WITH ile AS (
  SELECT MONTH(Data) AS miesiac, Ocena, COUNT(*) AS liczba
  FROM oceny GROUP BY miesiac, Ocena
)
SELECT miesiac, Ocena, liczba FROM ile
WHERE liczba = (SELECT MIN(liczba) FROM ile AS i WHERE i.miesiac = ile.miesiac);
