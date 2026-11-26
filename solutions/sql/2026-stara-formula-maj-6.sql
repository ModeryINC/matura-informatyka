-- Zadanie 6. Sieć sklepów (maj 2026, stara formuła) – zapytania wzorcowe.
-- 6.1
SELECT Imie, Nazwisko, COUNT(*) AS transakcji
FROM klienci JOIN transakcje ON transakcje.IdKlienta = klienci.IdKlienta
GROUP BY klienci.IdKlienta
ORDER BY transakcji DESC
LIMIT 1;
-- 6.2
SELECT Plec, COUNT(*)
FROM klienci
WHERE IdKlienta NOT IN (SELECT IdKlienta FROM transakcje)
GROUP BY Plec;
-- 6.3
SELECT COUNT(DISTINCT IdKlienta) FROM transakcje WHERE IdSprzedawcy IS NULL;
-- 6.4
SELECT COUNT(DISTINCT IdSklepu), SUM(Cena * Liczba)
FROM transakcje JOIN opis_transakcji ON opis_transakcji.IdTransakcji = transakcje.IdTransakcji
WHERE IdSprzedawcy IS NULL;
-- 6.5
SELECT IdSprzedawcy, MONTH(DataTransakcji) AS miesiac, COUNT(DISTINCT IdSklepu) AS sklepow
FROM transakcje
WHERE IdSprzedawcy IS NOT NULL
GROUP BY IdSprzedawcy, miesiac
ORDER BY sklepow DESC
LIMIT 1;

SELECT IdSklepu, COUNT(*) FROM transakcje
WHERE IdSprzedawcy = 14 AND MONTH(DataTransakcji) = 1
GROUP BY IdSklepu;
