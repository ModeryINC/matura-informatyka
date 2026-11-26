-- Zadanie 8. Szczepienia (czerwiec 2024) – zapytania wzorcowe.
-- 8.1
SELECT kod_szczepionki, COUNT(*) AS dawki
FROM wizyty
GROUP BY kod_szczepionki
ORDER BY dawki DESC;
-- 8.2
SELECT COUNT(DISTINCT pesel),
  COUNT(DISTINCT CASE WHEN CAST(substr(pesel, 10, 1) AS INTEGER) % 2 = 0 THEN pesel END)
FROM wizyty
WHERE kod_szczepionki = 'sz12_3d';
-- 8.3
SELECT YEAR(data_szczepienia) AS rok, MONTH(data_szczepienia) AS miesiac, COUNT(*) AS osob
FROM wizyty JOIN szczepionki ON szczepionki.kod_szczepionki = wizyty.kod_szczepionki
WHERE numer_dawki = liczba_dawek
GROUP BY rok, miesiac
ORDER BY osob DESC
LIMIT 1;
