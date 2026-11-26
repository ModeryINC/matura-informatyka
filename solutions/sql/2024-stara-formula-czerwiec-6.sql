-- Zadanie 6. Szczepienia (czerwiec 2024, stara formuła) – zapytania wzorcowe.
-- 6.1
SELECT kod_szczepionki, COUNT(*) AS dawki
FROM wizyty
GROUP BY kod_szczepionki
ORDER BY dawki DESC;
-- 6.2
SELECT COUNT(DISTINCT pesel),
  COUNT(DISTINCT CASE WHEN CAST(substr(pesel, 10, 1) AS INTEGER) % 2 = 0 THEN pesel END)
FROM wizyty
WHERE kod_szczepionki = 'sz12_3d';
-- 6.3
SELECT YEAR(data_szczepienia) AS rok, MONTH(data_szczepienia) AS miesiac, COUNT(*) AS osob
FROM wizyty JOIN szczepionki ON szczepionki.kod_szczepionki = wizyty.kod_szczepionki
WHERE numer_dawki = liczba_dawek
GROUP BY rok, miesiac
ORDER BY osob DESC
LIMIT 1;
-- 6.4
SELECT COUNT(*) FROM (
  SELECT pesel, wizyty.kod_szczepionki
  FROM wizyty JOIN szczepionki ON szczepionki.kod_szczepionki = wizyty.kod_szczepionki
  GROUP BY pesel, wizyty.kod_szczepionki
  HAVING MAX(numer_dawki) < MAX(liczba_dawek)
);
-- 6.5
SELECT WEEKDAY(data_szczepienia) AS dzien, COUNT(*)
FROM wizyty
GROUP BY dzien
ORDER BY (dzien + 5) % 7;
