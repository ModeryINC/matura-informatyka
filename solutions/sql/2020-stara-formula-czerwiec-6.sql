-- Zadanie 6. Usługi hostingowe (czerwiec 2020, stara formuła) – zapytania wzorcowe.
-- 6.1
SELECT COUNT(*) FROM umowy WHERE data_zakonczenia BETWEEN '2018-06-01' AND '2018-06-30';
-- 6.2
SELECT LEFT(ID_klienta, 1) AS kategoria, COUNT(*) FROM umowy GROUP BY kategoria;
-- 6.3
SELECT * FROM klienci WHERE ID_klienta NOT IN (SELECT ID_klienta FROM umowy);
-- 6.4
SELECT klient, [nazwa uslugi], data_zakonczenia
FROM umowy
JOIN klienci ON klienci.ID_klienta = umowy.ID_klienta
JOIN uslugi ON uslugi.ID_uslugi = umowy.ID_uslugi
WHERE date(data_rozpoczecia, '+5 years', '-1 day') = data_zakonczenia
ORDER BY data_zakonczenia;
-- 6.5
SELECT klienci.ID_klienta, klient
FROM umowy
JOIN klienci ON klienci.ID_klienta = umowy.ID_klienta
JOIN uslugi ON uslugi.ID_uslugi = umowy.ID_uslugi
GROUP BY klienci.ID_klienta
HAVING SUM([nazwa uslugi] LIKE '%poczta%') >= 4 AND SUM([nazwa uslugi] LIKE '%serwer www%') >= 3
ORDER BY klient;
