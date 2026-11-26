-- Zadanie 6. Oceny (czerwiec 2026, stara formuła) – zapytania wzorcowe.
-- 6.1
SELECT Id_Klasy, ROUND(AVG(Ocena), 2) AS srednia
FROM oceny JOIN uczniowie ON uczniowie.Id_Ucznia = oceny.Id_Ucznia
GROUP BY Id_Klasy
ORDER BY srednia;
-- 6.2
WITH szostki AS (
  SELECT oceny.Id_Ucznia, Id_Klasy, COUNT(*) AS liczba
  FROM oceny JOIN uczniowie ON uczniowie.Id_Ucznia = oceny.Id_Ucznia
  WHERE Ocena = 6
  GROUP BY oceny.Id_Ucznia
)
SELECT * FROM szostki WHERE liczba = (SELECT MAX(liczba) FROM szostki);
-- 6.3
SELECT Plec, ROUND(AVG(Ocena), 2)
FROM oceny
JOIN uczniowie ON uczniowie.Id_Ucznia = oceny.Id_Ucznia
JOIN nauczyciele ON nauczyciele.Id_Naucz = oceny.Id_Naucz
WHERE Przedmiot = 'matematyka'
GROUP BY Plec;
-- 6.4
WITH ile AS (
  SELECT MONTH(Data) AS miesiac, Ocena, COUNT(*) AS liczba
  FROM oceny GROUP BY miesiac, Ocena
)
SELECT miesiac, Ocena, liczba FROM ile
WHERE liczba = (SELECT MIN(liczba) FROM ile AS i WHERE i.miesiac = ile.miesiac);

-- 6.5
SELECT DISTINCT Id_Naucz FROM oceny
WHERE Id_Naucz NOT IN (
  SELECT Id_Naucz FROM oceny
  WHERE Ocena = 1 AND Data BETWEEN '2023-12-01' AND '2023-12-31'
);
