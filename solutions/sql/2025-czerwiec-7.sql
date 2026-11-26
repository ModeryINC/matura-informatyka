-- Zadanie 7. Fryzjerzy (czerwiec 2025) – zapytania wzorcowe.
-- 7.1
SELECT klienci.imie, nazwisko, SUM(cena) AS suma
FROM wizyty
JOIN klienci ON klienci.id_klienta = wizyty.id_klienta
JOIN uslugi ON uslugi.id_uslugi = wizyty.id_uslugi
GROUP BY klienci.id_klienta
ORDER BY suma DESC
LIMIT 1;
-- 7.2
SELECT DISTINCT klienci.id_klienta, klienci.imie, nazwisko
FROM wizyty
JOIN klienci ON klienci.id_klienta = wizyty.id_klienta
JOIN fryzjerzy ON fryzjerzy.id_fryzjera = wizyty.id_fryzjera
WHERE klienci.imie = fryzjerzy.imie
ORDER BY klienci.imie;
-- 7.3
SELECT SUM(cena) * 0.1
FROM wizyty
JOIN klienci ON klienci.id_klienta = wizyty.id_klienta
JOIN uslugi ON uslugi.id_uslugi = wizyty.id_uslugi
WHERE emeryt = 'TAK' AND time(termin) BETWEEN '10:00:00' AND '12:00:00';
-- 7.4
SELECT DISTINCT fryzjerzy.id_fryzjera, imie
FROM wizyty JOIN fryzjerzy ON fryzjerzy.id_fryzjera = wizyty.id_fryzjera
WHERE MONTH(termin) = 4 AND fryzjerzy.id_fryzjera NOT IN (
  SELECT id_fryzjera FROM wizyty JOIN uslugi ON uslugi.id_uslugi = wizyty.id_uslugi
  WHERE MONTH(termin) = 4 AND nazwa = 'Strzyzenie meskie'
);
