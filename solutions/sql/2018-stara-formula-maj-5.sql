-- Zadanie 5. Gra (maj 2018, stara formuła) – zapytania wzorcowe.
-- 5.1
SELECT data_losowania, nr1, nr2, nr3, nr4, nr5
FROM wygrane
JOIN losowania ON losowania.id_losowania = wygrane.id_losowania
JOIN punkty ON punkty.id_punktu = wygrane.id_punktu
WHERE miasto = 'Swidnica'
ORDER BY data_losowania;
-- 5.2
SELECT miasto, data_losowania
FROM wygrane
JOIN losowania ON losowania.id_losowania = wygrane.id_losowania
JOIN punkty ON punkty.id_punktu = wygrane.id_punktu
ORDER BY nr1 + nr2 + nr3 + nr4 + nr5 DESC
LIMIT 1;
-- 5.3
SELECT data_losowania
FROM wygrane
JOIN losowania ON losowania.id_losowania = wygrane.id_losowania
JOIN punkty ON punkty.id_punktu = wygrane.id_punktu
WHERE miasto = 'Krakow' AND DAY(data_losowania) IN (nr1, nr2, nr3, nr4, nr5);
-- 5.4
SELECT miasto, COUNT(*) AS wygranych
FROM wygrane JOIN punkty ON punkty.id_punktu = wygrane.id_punktu
GROUP BY miasto
HAVING wygranych >= 17
ORDER BY miasto;
-- 5.5
SELECT data_losowania FROM losowania
WHERE id_losowania NOT IN (SELECT id_losowania FROM wygrane);
