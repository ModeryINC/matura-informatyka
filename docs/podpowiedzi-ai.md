# Podpowiedzi AI (Google Gemini)

Na stronie zadania, w kolumnie z konsolą, jest panel **„Podpowiedzi AI”**. AI dostaje treść
zadania, kod ucznia i wynik ostatniego sprawdzenia (albo uruchomienia) i odpowiada krótką
wskazówką – bez gotowego rozwiązania. Każda kolejna prośba zawiera wcześniejsze podpowiedzi,
więc wskazówki są coraz bardziej konkretne.

Kod: [`src/lib/hints.ts`](../src/lib/hints.ts) (prompt, zapytanie, limity),
[`src/components/HintPanel.tsx`](../src/components/HintPanel.tsx) (interfejs).

## Model

Domyślnie **`gemini-3.5-flash-lite`**. Na darmowym planie Flash-Lite ma najwięcej zapytań
(ok. 15/min i kilkaset dziennie, według odczytów z Google AI Studio z października 2026),
a do krótkich wskazówek jakość jest wystarczająca. Mocniejszy `gemini-3.8-flash` daje
na darmowym planie tylko ok. 20 zapytań dziennie na cały klucz, czyli na wszystkich
użytkowników strony razem.

Model można zmienić bez zmiany kodu: zmienna `AI_MODEL` w środowisku `github-pages`.
Aktualne limity Twojego projektu widać w Google AI Studio (_Usage & limits_).

## Konfiguracja

1. Klucz z [Google AI Studio](https://aistudio.google.com/apikey).
2. GitHub → _Settings → Environments → github-pages_: dodaj `AI_API_KEY` (jako sekret
   albo zmienną – workflow czyta oba).
3. Wdrożenie (push na `main` albo ręczne uruchomienie workflow) wbuduje klucz w stronę.
   Bez klucza panel się nie pokazuje.

Lokalnie: plik `.env.local` (jest w `.gitignore`):

```
VITE_AI_API_KEY=twój-klucz
```

## Bezpieczeństwo klucza – ważne

Strona nie ma serwera, więc **klucz jest w publicznym kodzie JavaScript** i każdy może
go odczytać z narzędzi deweloperskich przeglądarki. Dlatego:

- **ogranicz klucz** w [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials):
  - _Application restrictions_ → **Websites** → `https://moderyinc.github.io/*`
    (oraz `http://localhost:5173/*` do pracy lokalnej),
  - _API restrictions_ → tylko **Generative Language API**;
- **nie włączaj płatności** w tym projekcie Google Cloud – na darmowym planie nadużycie
  klucza może najwyżej wyczerpać limit, nie wygeneruje kosztów;
- jeśli klucz wycieknie lub limit będzie zjadany przez kogoś innego – wygeneruj nowy
  i podmień `AI_API_KEY`.

Ograniczenie do domeny działa w przeglądarkach (nagłówek `Referer`), ale nie zatrzyma
kogoś, kto podrobi nagłówek. Strona dodatkowo ogranicza zapytania z jednej przeglądarki:
co najmniej 20 s odstępu i 25 podpowiedzi dziennie (`HINT_COOLDOWN_MS`, `HINT_DAILY_LIMIT`).

Pełna ochrona wymagałaby małego pośrednika (np. Cloudflare Worker) trzymającego klucz po
stronie serwera – to wykracza poza hosting na samym GitHub Pages.

## Prywatność

Panel informuje, że treść zadania i kod są wysyłane do Google Gemini. Na darmowym planie
Google może używać danych z zapytań do ulepszania swoich usług – nie wpisuj w kodzie
danych osobowych.
