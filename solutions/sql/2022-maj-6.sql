-- Zadanie 6. System kontroli dostępu (maj 2022) – zapytania wzorcowe.
-- 6.1
SELECT COUNT(*)
FROM ewidencja
JOIN uczen ON uczen.IdUcznia = ewidencja.IdUcznia
JOIN klasa ON klasa.IdKlasy = uczen.IdKlasy
WHERE ProfilKlasy = 'biologiczno-chemiczny' AND Imie LIKE '%a';
-- 6.2
SELECT date(Wejscie) AS dzien, COUNT(*)
FROM ewidencja
WHERE time(Wejscie) <= '08:00:00'
GROUP BY dzien
ORDER BY dzien;
-- 6.3
SELECT uczen.IdUcznia, Imie, Nazwisko
FROM ewidencja JOIN uczen ON uczen.IdUcznia = ewidencja.IdUcznia
GROUP BY uczen.IdUcznia
ORDER BY SUM(julianday(Wyjscie) - julianday(Wejscie)) DESC
LIMIT 3;
-- 6.4
SELECT Imie, Nazwisko FROM uczen
WHERE IdUcznia NOT IN (SELECT IdUcznia FROM ewidencja WHERE date(Wejscie) = '2022-04-06');
