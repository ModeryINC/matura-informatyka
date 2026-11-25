# Podpowiedzi AI (Google Gemini)

Na stronie zadania, w kolumnie z konsolą, jest panel **„Podpowiedzi AI”**. AI dostaje treść
zadania, kod ucznia i wynik ostatniego sprawdzenia (albo uruchomienia) i odpowiada krótką
wskazówką – bez gotowego rozwiązania. Każda kolejna prośba zawiera wcześniejsze podpowiedzi,
więc wskazówki są coraz bardziej konkretne.

## Jak to działa

```
przeglądarka ──POST {prompt}──▶ Cloudflare Worker ──klucz + instrukcja──▶ Gemini API
 (strona na GitHub Pages,        (worker/, klucz jako sekret,
  zna tylko adres Workera)        Origin + limit na IP)
```

- **Strona** ([`src/lib/hints.ts`](../src/lib/hints.ts),
  [`src/components/HintPanel.tsx`](../src/components/HintPanel.tsx)) buduje prompt z zadania
  i kodu i wysyła go do Workera. W kodzie strony **nie ma klucza** – tylko adres Workera
  (`VITE_AI_ENDPOINT`). Pilnuje też limitu z jednej przeglądarki: 20 s odstępu, 25 dziennie.
- **Worker** ([`worker/src/index.ts`](../worker/src/index.ts)) trzyma klucz jako sekret
  `GEMINI_API_KEY`, sam dokłada instrukcję systemową i model, więc nie da się go użyć jako
  ogólnego dostępu do Gemini. Przyjmuje zapytania tylko ze stron z `ALLOWED_ORIGINS`
  i najwyżej 5 na minutę z jednego adresu IP (Cloudflare Rate Limiting). Błędy Gemini
  (np. dotyczące klucza) zostają w logach Workera.

## Model

Domyślnie **`gemini-3.5-flash-lite`** – na darmowym planie ma najwięcej zapytań
(ok. 15/min i kilkaset dziennie według odczytów z Google AI Studio z października 2026),
a do krótkich wskazówek jakość jest wystarczająca. Mocniejszy `gemini-3.8-flash` daje
na darmowym planie tylko ok. 20 zapytań dziennie na cały klucz. Model zmienia się w
[`worker/wrangler.toml`](../worker/wrangler.toml) (`AI_MODEL`).

## Konfiguracja (jednorazowo)

1. **Konto Cloudflare** (darmowe) na <https://dash.cloudflare.com/sign-up>. Wejdź raz w
   _Workers & Pages_ i wybierz subdomenę `workers.dev` (np. `moderyinc.workers.dev`).
2. **Token API**: _My Profile → API Tokens → Create Token_ → szablon **„Edit Cloudflare
   Workers”** (konto: Twoje, strefy: wszystkie albo żadna). Skopiuj token.
3. **Account ID**: na stronie _Workers & Pages_ (prawa kolumna) albo w adresie panelu.
4. GitHub → _Settings → Environments → github-pages_:
   - sekret `CLOUDFLARE_API_TOKEN` – token z punktu 2,
   - sekret lub zmienna `CLOUDFLARE_ACCOUNT_ID` – z punktu 3,
   - sekret `AI_API_KEY` – klucz Gemini z [Google AI Studio](https://aistudio.google.com/apikey).

   Klucz i token muszą być **sekretami** (_Environment secrets_), nie zmiennymi: zmienne GitHub
   wypisuje w logach otwartym tekstem, a logi publicznego repo są dostępne dla każdego.
   Workflow przerwie się z komunikatem, jeśli znajdzie je wśród zmiennych.
5. Uruchom workflow (push na `main` albo _Actions → CI/CD → Run workflow_). Job
   „Pośrednik podpowiedzi AI” wdroży Workera i wgra do niego klucz, a build strony dostanie
   adres Workera automatycznie.

Bez `CLOUDFLARE_API_TOKEN` Worker nie jest wdrażany, a panel podpowiedzi się nie pokazuje
(chyba że ustawisz zmienną `AI_ENDPOINT` z adresem Workera wdrożonego ręcznie).

**Po przejściu na Workera wygeneruj nowy klucz Gemini** i podmień `AI_API_KEY` – poprzedni
był wbudowany w publiczny kod strony, więc trzeba go uznać za ujawniony (usuń go w AI Studio).

## Praca lokalna

```bash
cd worker
echo "GEMINI_API_KEY=twój-klucz" > .dev.vars   # plik jest w .gitignore
npx wrangler dev                                # http://localhost:8787
```

i w głównym katalogu plik `.env.local`:

```
VITE_AI_ENDPOINT=http://localhost:8787
```

## Prywatność

Panel informuje, że treść zadania i kod są wysyłane do Google Gemini. Na darmowym planie
Google może używać danych z zapytań do ulepszania swoich usług – nie wpisuj w kodzie
danych osobowych.
