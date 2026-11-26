-- Zadanie 8. Sieć sklepów (maj 2026) – zapytania wzorcowe.
-- 8.1
SELECT Imie, Nazwisko, COUNT(*) AS transakcji
FROM klienci JOIN transakcje ON transakcje.IdKlienta = klienci.IdKlienta
GROUP BY klienci.IdKlienta
ORDER BY transakcji DESC
LIMIT 1;
-- 8.2
SELECT Plec, COUNT(*)
FROM klienci
WHERE IdKlienta NOT IN (SELECT IdKlienta FROM transakcje)
GROUP BY Plec;
-- 8.3
SELECT COUNT(DISTINCT IdSklepu), SUM(Cena * Liczba)
FROM transakcje JOIN opis_transakcji ON opis_transakcji.IdTransakcji = transakcje.IdTransakcji
WHERE IdSprzedawcy IS NULL;
-- 8.4
SELECT IdSprzedawcy, MONTH(DataTransakcji) AS miesiac, COUNT(DISTINCT IdSklepu) AS sklepow
FROM transakcje
WHERE IdSprzedawcy IS NOT NULL
GROUP BY IdSprzedawcy, miesiac
ORDER BY sklepow DESC
LIMIT 1;
