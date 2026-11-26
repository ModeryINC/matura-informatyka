import { useEffect, useState, type ReactNode } from 'react';
import { LuCheck, LuPause, LuPlay } from 'react-icons/lu';

/**
 * Animacja w sekcji hero: po kolei rozwiązanie zadania w Pythonie, w Excelu i w SQL,
 * pisane znak po znaku i „sprawdzane” z kluczem. Zadanie jest prawdziwe
 * (maj 2023, zadanie 6.2 – w 19 dniach dostarczono najwięcej porzeczek).
 *
 * Ruch włącza się tylko bez preferencji ograniczenia animacji; przycisk
 * pauzy zatrzymuje także pływające w tle symbole (WCAG 2.2.2).
 */

interface Scene {
  kind: 'python' | 'excel' | 'sql';
  title: string;
  code: string;
  result: string;
}

const SCENES: Scene[] = [
  {
    kind: 'python',
    title: 'rozwiazanie.py',
    code: `dni = 0
with open("owoce.txt") as plik:
    next(plik)
    for linia in plik:
        data, m, t, p = linia.split()
        if int(p) > max(int(m), int(t)):
            dni += 1
print(dni)`,
    result: '19',
  },
  {
    kind: 'excel',
    title: 'owoce.xlsx',
    code: '=JEŻELI(ORAZ(D2>B2;D2>C2);1;0)',
    result: '19',
  },
  {
    kind: 'sql',
    title: 'zapytanie.sql',
    code: `SELECT COUNT(*) AS dni
FROM owoce
WHERE porzeczki > maliny
  AND porzeczki > truskawki;`,
    result: '19',
  },
];

const TAGS: Record<Scene['kind'], string> = { python: 'Python', excel: 'Excel', sql: 'SQL' };
/** Co stoi przed wynikiem w dolnej części okna. */
const PROMPTS: Record<Scene['kind'], string> = {
  python: '>>>',
  excel: '=SUMA(E2:E154)',
  sql: 'dni =',
};

const TYPE_MS = 45;
/** Klatki po napisaniu kodu: wynik, dwa testy, przerwa przed kolejną sceną. */
const AFTER = { output: 8, check1: 20, check2: 30, next: 85 };

const WORDS =
  'with|open|as|for|in|if|print|int|max|next|JEŻELI|ORAZ|SELECT|COUNT|AS|FROM|WHERE|AND';
const KEYWORDS = new RegExp(`^(?:${WORDS})$`);
const TOKEN = new RegExp(String.raw`("[^"]*"?|\b\d+\b|\b(?:${WORDS})\b)`);

/** Proste kolorowanie składni dla częściowo napisanego kodu. */
function highlight(code: string): ReactNode[] {
  return code.split(TOKEN).map((part, i) => {
    if (!part) return null;
    if (part.startsWith('"'))
      return (
        <span key={i} className="hl-string">
          {part}
        </span>
      );
    if (/^\d+$/.test(part))
      return (
        <span key={i} className="hl-number">
          {part}
        </span>
      );
    if (KEYWORDS.test(part))
      return (
        <span key={i} className="hl-keyword">
          {part}
        </span>
      );
    return part;
  });
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/** Sterowanie animacją (wydzielone, żeby dało się je testować). */
function useHeroAnimation() {
  const [reduced] = useState(prefersReducedMotion);
  const [paused, setPaused] = useState(false);
  const [{ scene, frame }, setPosition] = useState({ scene: 0, frame: 0 });
  const current = SCENES[scene]!;
  const total = current.code.length + AFTER.next;

  // Kolejna klatka; po ostatniej przechodzimy do następnej sceny.
  useEffect(() => {
    if (reduced || paused) return;
    const timer = setInterval(
      () =>
        setPosition((p) =>
          p.frame + 1 < SCENES[p.scene]!.code.length + AFTER.next
            ? { scene: p.scene, frame: p.frame + 1 }
            : { scene: (p.scene + 1) % SCENES.length, frame: 0 },
        ),
      TYPE_MS,
    );
    return () => clearInterval(timer);
  }, [reduced, paused]);

  // Bez animacji pokazujemy od razu stan końcowy.
  const shown = reduced ? total - 1 : frame;
  const after = shown - current.code.length;
  return {
    reduced,
    paused,
    togglePause: () => setPaused((p) => !p),
    scene: current,
    typed: current.code.slice(0, shown),
    typing: after < 0,
    showOutput: after >= AFTER.output,
    check1: after >= AFTER.check1,
    check2: after >= AFTER.check2,
  };
}

const ROWS = [
  ['01.05.2020', '211', '281', '88'],
  ['02.05.2020', '393', '313', '83'],
  ['03.05.2020', '389', '315', '104'],
  ['04.05.2020', '308', '221', '119'],
];

export function HeroDemo() {
  const demo = useHeroAnimation();
  const { scene } = demo;
  const python = scene.kind === 'python';
  const sql = scene.kind === 'sql';
  const excel = scene.kind === 'excel';
  const caret = demo.typing && !demo.reduced && <span className="hero-caret" />;
  // Kolumna E wypełnia się po wpisaniu formuły (w ukrytej scenie – od razu, by zająć miejsce).
  const filled = !excel || demo.showOutput;

  return (
    <div className="hero-demo" data-paused={demo.paused || undefined}>
      <div className="hero-demo__glyphs" aria-hidden="true">
        {['def', '{ }', '=SUMA', 'SELECT', '0101', 'for', '∑', 'if', 'print()', '%'].map(
          (glyph, i) => (
            <span
              key={glyph}
              style={{ '--i': i, '--top': `${6 + ((i * 37) % 88)}%` } as React.CSSProperties}
            >
              {glyph}
            </span>
          ),
        )}
      </div>

      <figure
        className={`hero-window hero-window--${scene.kind}`}
        aria-label="Przykład: rozwiązanie zadania 6.2 z matury 2023 w Pythonie, w Excelu i w SQL, sprawdzone z kluczem"
      >
        <div className="hero-window__bar" aria-hidden="true">
          <span className="hero-window__dots">
            <i />
            <i />
            <i />
          </span>
          <span className="hero-window__title">{scene.title}</span>
          <span className="hero-window__tag">{TAGS[scene.kind]}</span>
        </div>

        <div className="hero-window__body" aria-hidden="true">
          {/*
           * Wszystkie sceny leżą w tej samej komórce siatki (nieaktywne są niewidoczne,
           * ale zajmują miejsce), więc okno ma zawsze ten sam rozmiar – największy
           * z nich – niezależnie od szerokości ekranu i czcionki.
           */}
          <div className="hero-stage">
            <pre className={`hero-code${python ? '' : ' is-hidden'}`}>
              <code>
                {highlight(python ? demo.typed : SCENES[0]!.code)}
                {python && caret}
              </code>
            </pre>
            <pre className={`hero-code${sql ? '' : ' is-hidden'}`}>
              <code>
                {highlight(sql ? demo.typed : SCENES[2]!.code)}
                {sql && caret}
              </code>
            </pre>
            <div className={`hero-sheet${excel ? '' : ' is-hidden'}`}>
              <div className="hero-sheet__formula">
                <span>fx</span>
                <code>
                  {highlight(excel ? demo.typed : SCENES[1]!.code)}
                  {excel && caret}
                </code>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>data</th>
                    <th>maliny</th>
                    <th>truskawki</th>
                    <th>porzeczki</th>
                    <th>E</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => (
                        <td key={c}>{cell}</td>
                      ))}
                      <td className={filled ? 'hero-sheet__filled' : ''}>
                        {filled
                          ? Number(row[3]) > Math.max(Number(row[1]), Number(row[2]))
                            ? 1
                            : 0
                          : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="hero-output">
            <div className={`hero-output__line${demo.showOutput ? ' is-visible' : ''}`}>
              <span className="muted">{PROMPTS[scene.kind]}</span> <strong>{scene.result}</strong>
            </div>
            <div className="hero-checks">
              <span className={`hero-check${demo.check1 ? ' is-visible' : ''}`}>
                <LuCheck aria-hidden className="icon" /> Dane przykładowe
              </span>
              <span className={`hero-check${demo.check2 ? ' is-visible' : ''}`}>
                <LuCheck aria-hidden className="icon" /> Klucz CKE: 19
              </span>
            </div>
          </div>
        </div>
      </figure>

      {!demo.reduced && (
        <button type="button" className="hero-demo__pause" onClick={demo.togglePause}>
          {demo.paused ? (
            <>
              <LuPlay aria-hidden className="icon" /> Wznów animację
            </>
          ) : (
            <>
              <LuPause aria-hidden className="icon" /> Zatrzymaj animację
            </>
          )}
        </button>
      )}
    </div>
  );
}
