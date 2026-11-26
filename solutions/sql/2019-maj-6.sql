-- Zadanie 6. Perfumeria DlaWas (maj 2019) – zapytania wzorcowe.
-- 6.1
SELECT nazwa_p
FROM perfumy JOIN sklad ON sklad.id_perfum = perfumy.id_perfum
WHERE nazwa_skladnika = 'absolut jasminu';
-- 6.2
SELECT rodzina_zapachow, cena, nazwa_p
FROM perfumy
WHERE cena = (SELECT MIN(cena) FROM perfumy AS p WHERE p.rodzina_zapachow = perfumy.rodzina_zapachow)
ORDER BY rodzina_zapachow;
-- 6.3
SELECT nazwa_m FROM marki
WHERE id_marki NOT IN (
  SELECT id_marki FROM perfumy JOIN sklad ON sklad.id_perfum = perfumy.id_perfum
  WHERE nazwa_skladnika LIKE '%paczula%'
)
ORDER BY nazwa_m;
-- 6.4
SELECT nazwa_p, ROUND(cena * 0.85, 2) AS nowa_cena
FROM perfumy JOIN marki ON marki.id_marki = perfumy.id_marki
WHERE nazwa_m = 'Mou De Rosine' AND rodzina_zapachow = 'orientalno-drzewna'
ORDER BY nowa_cena;
-- 6.5
SELECT nazwa_m, MIN(rodzina_zapachow)
FROM perfumy JOIN marki ON marki.id_marki = perfumy.id_marki
GROUP BY marki.id_marki
HAVING COUNT(DISTINCT rodzina_zapachow) = 1;
