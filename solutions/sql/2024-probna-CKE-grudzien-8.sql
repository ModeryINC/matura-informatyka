-- Zadanie 8. Serwis samochodowy (próbna CKE, grudzień 2024) – zapytania wzorcowe.
-- Usługa 107 ma w pliku przesunięte kolumny (pusta cena), stąd w kluczu druga kwota w 8.4.
-- 8.1
SELECT COUNT(DISTINCT nr_rejestracyjny)
FROM wykonane
WHERE nr_rejestracyjny NOT LIKE 'S%';
-- 8.2
SELECT usluga, COUNT(*) AS ile
FROM wykonane JOIN uslugi ON uslugi.id_uslugi = wykonane.id_uslugi
GROUP BY usluga
ORDER BY ile DESC
LIMIT 1;
SELECT DISTINCT marka FROM samochody
WHERE marka NOT IN (
  SELECT marka
  FROM samochody
  JOIN wykonane ON wykonane.nr_rejestracyjny = samochody.nr_rejestracyjny
  JOIN uslugi ON uslugi.id_uslugi = wykonane.id_uslugi
  WHERE usluga = 'wymiana plynu chlodniczego'
);
-- 8.3
SELECT id_wlasciciela
FROM wykonane
JOIN samochody ON samochody.nr_rejestracyjny = wykonane.nr_rejestracyjny
JOIN uslugi ON uslugi.id_uslugi = wykonane.id_uslugi
GROUP BY id_wlasciciela
ORDER BY SUM(cena) DESC
LIMIT 1;
SELECT samochody.nr_rejestracyjny, usluga
FROM wykonane
JOIN samochody ON samochody.nr_rejestracyjny = wykonane.nr_rejestracyjny
JOIN uslugi ON uslugi.id_uslugi = wykonane.id_uslugi
WHERE id_wlasciciela = 897;
-- 8.4
SELECT SUM(CASE WHEN MONTH(data) = 11 THEN cena END) AS listopad,
  SUM(CASE WHEN MONTH(data) = 12 THEN cena END) AS grudzien
FROM wykonane JOIN uslugi ON uslugi.id_uslugi = wykonane.id_uslugi;
