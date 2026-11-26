-- Zadanie 5. Hotel „Panorama” (próbna CKE, grudzień 2022) – zapytania wzorcowe.
-- 5.1
SELECT imie, nazwisko, SUM(julianday(data_wyjazdu) - julianday(data_przyjazdu)) AS noclegow
FROM noclegi JOIN klienci ON klienci.nr_dowodu = noclegi.nr_dowodu
GROUP BY klienci.nr_dowodu
ORDER BY noclegow DESC
LIMIT 1;
-- 5.2
SELECT imie, nazwisko
FROM noclegi
JOIN klienci ON klienci.nr_dowodu = noclegi.nr_dowodu
JOIN pokoje ON pokoje.nr_pokoju = noclegi.nr_pokoju
GROUP BY klienci.nr_dowodu
HAVING SUM((julianday(data_wyjazdu) - julianday(data_przyjazdu)) * cena) > 2000;
-- 5.3
SELECT nr_pokoju FROM pokoje
WHERE standard = 'N' AND nr_pokoju NOT IN (
  SELECT nr_pokoju FROM noclegi JOIN klienci ON klienci.nr_dowodu = noclegi.nr_dowodu
  WHERE miejscowosc IN ('Opole', 'Katowice')
);
