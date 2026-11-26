-- Zadanie 6. Salon urody (próbna CKE, kwiecień 2020) – zapytania wzorcowe.
-- 6.1
SELECT SUM([cena (zl)])
FROM wizytydane
JOIN klienci ON klienci.id_klienta = wizytydane.id_klienta
JOIN wizytyzabiegi ON wizytyzabiegi.id_wizyty = wizytydane.id_wizyty
JOIN zabiegi ON zabiegi.kod_zabiegu = wizytyzabiegi.kod_zabiegu
WHERE imie = 'Alicja' AND nazwisko = 'Kowalska';
-- 6.2
SELECT imie, nazwisko, COUNT(*) AS wizyt
FROM wizytydane JOIN klienci ON klienci.id_klienta = wizytydane.id_klienta
GROUP BY klienci.id_klienta
ORDER BY wizyt DESC
LIMIT 1;
-- 6.3
SELECT COUNT(*)
FROM wizytydane
JOIN wizytyzabiegi ON wizytyzabiegi.id_wizyty = wizytydane.id_wizyty
JOIN zabiegi ON zabiegi.kod_zabiegu = wizytyzabiegi.kod_zabiegu
WHERE zabieg = 'Magia Hawajow';
SELECT data
FROM wizytydane
JOIN wizytyzabiegi ON wizytyzabiegi.id_wizyty = wizytydane.id_wizyty
JOIN zabiegi ON zabiegi.kod_zabiegu = wizytyzabiegi.kod_zabiegu
WHERE zabieg = 'Magia Hawajow'
ORDER BY data DESC;
-- 6.4
SELECT COUNT(DISTINCT wizytydane.id_klienta), SUM([cena (zl)]) * 0.8
FROM wizytydane
JOIN wizytyzabiegi ON wizytyzabiegi.id_wizyty = wizytydane.id_wizyty
JOIN zabiegi ON zabiegi.kod_zabiegu = wizytyzabiegi.kod_zabiegu
WHERE wizytydane.id_klienta LIKE 'X%' AND dzial = 'MAKIJAZ'
  AND data BETWEEN '2017-12-06' AND '2018-01-15';
-- 6.5
SELECT zabieg FROM zabiegi
WHERE dzial = 'FRYZJER MESKI' AND kod_zabiegu NOT IN (SELECT kod_zabiegu FROM wizytyzabiegi);
