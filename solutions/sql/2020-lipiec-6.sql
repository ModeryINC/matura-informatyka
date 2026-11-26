-- Zadanie 6. Ankieta (lipiec 2020) – zapytania wzorcowe.
-- 6.1
SELECT SUM(Imie LIKE '%a'), SUM(Imie NOT LIKE '%a') FROM dane_ankiet;
-- 6.2
SELECT Srod_lok, COUNT(DISTINCT lok.Id)
FROM lok JOIN dane_ankiet ON dane_ankiet.Id = lok.Id
WHERE Wojewodztwo = 'Mazowieckie' AND Pora_roku = 'lato'
GROUP BY Srod_lok;
-- 6.3
SELECT Wojewodztwo, COUNT(*) AS osob
FROM dane_ankiet
GROUP BY Wojewodztwo
HAVING osob > 20;
-- 6.4
SELECT Nazwisko, Imie, Wojewodztwo
FROM dane_ankiet
WHERE Wiek > 50 AND Wyksztalcenie IN ('wyzsze', 'srednie')
  AND Id NOT IN (SELECT Id FROM zain WHERE Zainteresowania IN ('informatyka', 'gry komputerowe'))
ORDER BY Nazwisko;
-- 6.5
SELECT AVG(Dochod) FROM dane_ankiet
WHERE Imie LIKE '%a' AND Wojewodztwo = 'Zachodniopomorskie'
  AND Id IN (SELECT Id FROM lok WHERE Srod_lok = 'rower');
