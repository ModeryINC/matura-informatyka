-- Zadanie 5. Oscary (maj 2019, stara formuła) – zapytania wzorcowe.
-- W kluczu do 5.1 brakuje Włoch (3 laureatów), choć wynikają z danych – zestawienie ma 23 kraje.
-- 5.1
SELECT kraj_urodzenia, COUNT(DISTINCT aktorzy.id_aktora) AS aktorow
FROM nagrody JOIN aktorzy ON aktorzy.id_aktora = nagrody.id_aktora
GROUP BY kraj_urodzenia
ORDER BY aktorow;
-- 5.2
SELECT imie, nazwisko, rok - YEAR(data_ur) AS wiek
FROM nagrody
JOIN aktorzy ON aktorzy.id_aktora = nagrody.id_aktora
JOIN filmy ON filmy.id_filmu = nagrody.id_filmu
ORDER BY wiek
LIMIT 1;
-- 5.3
SELECT imie, nazwisko
FROM nagrody JOIN aktorzy ON aktorzy.id_aktora = nagrody.id_aktora
GROUP BY aktorzy.id_aktora
ORDER BY COUNT(*) DESC
LIMIT 1;
SELECT rok, tytul
FROM nagrody
JOIN aktorzy ON aktorzy.id_aktora = nagrody.id_aktora
JOIN filmy ON filmy.id_filmu = nagrody.id_filmu
WHERE imie = 'Katharine' AND nazwisko = 'Hepburn';
-- 5.4
WITH n AS (
  SELECT id_aktora, rok, kategoria LIKE '%pierwszoplanow%' AS pierwszoplanowa
  FROM nagrody JOIN filmy ON filmy.id_filmu = nagrody.id_filmu
)
SELECT imie, nazwisko, MAX(ABS(a.rok - b.rok))
FROM n AS a
JOIN n AS b ON b.id_aktora = a.id_aktora AND a.pierwszoplanowa = 1 AND b.pierwszoplanowa = 0
JOIN aktorzy ON aktorzy.id_aktora = a.id_aktora
GROUP BY a.id_aktora;
