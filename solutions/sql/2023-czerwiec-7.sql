-- Zadanie 7. Instalacje (czerwiec 2023) – zapytania wzorcowe.
-- 7.1
SELECT typ_u, COUNT(*)
FROM instalacje JOIN urzadzenia ON urzadzenia.kod_u = instalacje.kod_u
GROUP BY typ_u;
-- 7.2
SELECT producent_u, COUNT(*) AS liczba
FROM instalacje JOIN urzadzenia ON urzadzenia.kod_u = instalacje.kod_u
WHERE data_i BETWEEN '2019-02-01' AND '2019-02-28'
GROUP BY producent_u
ORDER BY liczba DESC
LIMIT 1;
-- 7.3
SELECT nazwa_k, ROUND(COUNT(*) * 1000000.0 / ludnosc_k, 2) AS na_milion
FROM instalacje JOIN kraje ON kraje.kod_k = instalacje.kod_k
WHERE ludnosc_k >= 1000000
GROUP BY kraje.kod_k
ORDER BY na_milion DESC
LIMIT 5;
-- 7.4
SELECT urzadzenia.kod_u, nazwa_u, COUNT(DISTINCT kod_k) AS krajow
FROM instalacje JOIN urzadzenia ON urzadzenia.kod_u = instalacje.kod_u
WHERE typ_u = 'Tablet'
GROUP BY urzadzenia.kod_u
ORDER BY krajow DESC
LIMIT 1;
