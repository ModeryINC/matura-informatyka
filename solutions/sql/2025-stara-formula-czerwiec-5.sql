-- Zadanie 5. Fryzjerzy (czerwiec 2025, stara formuła) – zapytania wzorcowe.
-- 5.1
SELECT klienci.imie, nazwisko, SUM(cena) AS suma
FROM wizyty
JOIN klienci ON klienci.id_klienta = wizyty.id_klienta
JOIN uslugi ON uslugi.id_uslugi = wizyty.id_uslugi
GROUP BY klienci.id_klienta
ORDER BY suma DESC
LIMIT 1;
-- 5.2
SELECT DISTINCT fryzjerzy.id_fryzjera, imie
FROM wizyty JOIN fryzjerzy ON fryzjerzy.id_fryzjera = wizyty.id_fryzjera
WHERE MONTH(termin) = 4 AND fryzjerzy.id_fryzjera NOT IN (
  SELECT id_fryzjera FROM wizyty JOIN uslugi ON uslugi.id_uslugi = wizyty.id_uslugi
  WHERE MONTH(termin) = 4 AND nazwa = 'Strzyzenie meskie'
);

-- 5.3
SELECT DISTINCT klienci.id_klienta, klienci.imie, nazwisko
FROM wizyty
JOIN klienci ON klienci.id_klienta = wizyty.id_klienta
JOIN fryzjerzy ON fryzjerzy.id_fryzjera = wizyty.id_fryzjera
WHERE klienci.imie = fryzjerzy.imie
ORDER BY klienci.imie;
-- 5.4
SELECT
  CASE
    WHEN time(termin) <= '11:00:00' THEN 'do 11:00'
    WHEN time(termin) <= '13:00:00' THEN '11:00–13:00'
    WHEN time(termin) <= '16:00:00' THEN '13:00–16:00'
    ELSE 'po 16:00'
  END AS pora,
  COUNT(*)
FROM wizyty
GROUP BY pora
ORDER BY MIN(time(termin));
-- 5.5
SELECT SUM(cena) * 0.1
FROM wizyty
JOIN klienci ON klienci.id_klienta = wizyty.id_klienta
JOIN uslugi ON uslugi.id_uslugi = wizyty.id_uslugi
WHERE emeryt = 'TAK' AND time(termin) BETWEEN '10:00:00' AND '12:00:00';
SELECT COUNT(DISTINCT wizyty.id_klienta)
FROM wizyty JOIN klienci ON klienci.id_klienta = wizyty.id_klienta
WHERE emeryt = 'TAK' AND time(termin) BETWEEN '10:00:00' AND '12:00:00';
