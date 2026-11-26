-- Zadanie 5. Języki (czerwiec 2020) – zapytania wzorcowe.
-- 5.1
SELECT Rodzina, COUNT(*) AS jezykow
FROM jezyki
WHERE Rodzina <> 'jezyk izolowany'
GROUP BY Rodzina
ORDER BY jezykow DESC;
-- 5.2
SELECT COUNT(*) FROM jezyki
WHERE Jezyk NOT IN (SELECT Jezyk FROM uzytkownicy WHERE Urzedowy = 'tak');
-- 5.3
SELECT Jezyk
FROM uzytkownicy JOIN panstwa ON panstwa.Panstwo = uzytkownicy.Panstwo
GROUP BY Jezyk
HAVING COUNT(DISTINCT Kontynent) >= 4;
-- 5.4
SELECT jezyki.Jezyk, Rodzina, SUM(Uzytkownicy) AS razem
FROM uzytkownicy
JOIN panstwa ON panstwa.Panstwo = uzytkownicy.Panstwo
JOIN jezyki ON jezyki.Jezyk = uzytkownicy.Jezyk
WHERE Kontynent IN ('Ameryka Polnocna', 'Ameryka Poludniowa') AND Rodzina <> 'indoeuropejska'
GROUP BY jezyki.Jezyk
ORDER BY razem DESC
LIMIT 6;
-- 5.5
SELECT panstwa.Panstwo, Jezyk, ROUND(Uzytkownicy * 100.0 / Populacja, 2)
FROM uzytkownicy JOIN panstwa ON panstwa.Panstwo = uzytkownicy.Panstwo
WHERE Urzedowy = 'nie' AND Uzytkownicy >= 0.3 * Populacja;
