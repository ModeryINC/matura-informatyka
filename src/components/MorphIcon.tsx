import { useId, type CSSProperties, type ReactNode } from 'react';

/**
 * Ikony, które płynnie zmieniają się w siebie („morphicons”), w stylu ikon Lucide
 * (24×24, obrys 2 px, zaokrąglone końce).
 *
 * Każda para kształtów ma ścieżki o tej samej liczbie i rodzaju poleceń, więc
 * przeglądarka interpoluje właściwość CSS `d` (reguła `.morph-icon` w global.css).
 * Bez jej obsługi (Safari) zmienia się atrybut `d` i ikona po prostu się podmienia.
 */
const SHAPES = {
  // Pauza → odtwarzanie: lewy pasek staje się trójkątem, prawy chowa się w jego wierzchołku.
  pause: 'M6 4 L10 4 L10 20 L6 20 Z M14 4 L18 4 L18 20 L14 20 Z',
  play: 'M6 3 L20 12 L20 12 L6 21 Z M20 12 L20 12 L20 12 L20 12 Z',
  // Ptaszek ↔ krzyżyk: dwa odcinki obracają się w ramiona litery X.
  check: 'M4 12 L9 17 M9 17 L20 6',
  x: 'M6 6 L18 18 M6 18 L18 6',
  // Rozciągnij ↔ zmniejsz: groty strzałek przeskakują na drugą stronę ukośnych linii.
  maximize: 'M15 3 L21 3 L21 9 M9 21 L3 21 L3 15 M21 3 L14 10 M3 21 L10 14',
  minimize: 'M14 4 L14 10 L20 10 M10 20 L10 14 L4 14 M21 3 L14 10 M3 21 L10 14',
  'chevron-left': 'M15 18 L9 12 L15 6',
  'chevron-right': 'M9 18 L15 12 L9 6',
} as const;

export type MorphShape = keyof typeof SHAPES;

function Svg({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`icon morph-icon${className ? ` ${className}` : ''}`}
    >
      {children}
    </svg>
  );
}

/** Ikona z jednej ścieżki; zmiana `shape` płynnie przekształca jeden kształt w drugi. */
export function MorphIcon({ shape, className }: { shape: MorphShape; className?: string }) {
  const d = SHAPES[shape];
  return (
    <Svg className={className}>
      <path d={d} style={{ d: `path('${d}')` } as CSSProperties} />
    </Svg>
  );
}

/** Oko, które przekreśla się (rysowaną kreską) przy `off`. */
export function EyeMorphIcon({ off }: { off: boolean }) {
  const mask = useId();
  return (
    <Svg className={`morph-eye${off ? ' is-off' : ''}`}>
      <mask id={mask}>
        <rect width="24" height="24" fill="white" />
        <path className="morph-eye__slash" d="M2 2 L22 22" stroke="black" strokeWidth={5} />
      </mask>
      <g mask={`url(#${mask})`}>
        <path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" />
        <circle cx="12" cy="12" r="3" />
      </g>
      <path className="morph-eye__slash" d="M2 2 L22 22" />
    </Svg>
  );
}

export type ThemeShape = 'light' | 'dark' | 'system';

/** Geometria ikony motywu: promień tarczy i przesunięcie „cienia”, który wycina księżyc. */
const THEME_GEOMETRY: Record<ThemeShape, { r: number; cut: [number, number] }> = {
  light: { r: 4, cut: [10, -10] },
  system: { r: 6, cut: [2.5, -2.5] },
  dark: { r: 8, cut: [0, 0] },
};

/**
 * Słońce ↔ księżyc: tarcza rośnie, z rogu nasuwa się cień wycinający sierpień,
 * a promienie obracają się i chowają. Motyw systemowy to połowa drogi – słońce
 * z nadgryzioną tarczą.
 */
export function ThemeMorphIcon({ theme }: { theme: ThemeShape }) {
  const id = useId();
  const { r, cut } = THEME_GEOMETRY[theme];
  const cutStyle = { transform: `translate(${cut[0]}px, ${cut[1]}px)` };
  const coreStyle = { r } as CSSProperties;
  return (
    <Svg className={`morph-theme morph-theme--${theme}`}>
      <defs>
        <mask id={`${id}m`}>
          <rect x="-12" y="-12" width="48" height="48" fill="white" />
          <circle
            className="morph-theme__move"
            cx="17"
            cy="7"
            r="7"
            fill="black"
            style={cutStyle}
          />
        </mask>
        <clipPath id={`${id}c`}>
          <circle className="morph-theme__grow" cx="12" cy="12" r={r} style={coreStyle} />
        </clipPath>
      </defs>
      <circle
        className="morph-theme__grow"
        cx="12"
        cy="12"
        r={r}
        style={coreStyle}
        mask={`url(#${id}m)`}
      />
      <g clipPath={`url(#${id}c)`}>
        <circle className="morph-theme__move" cx="17" cy="7" r="7" style={cutStyle} />
      </g>
      <g className="morph-theme__rays">
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </g>
    </Svg>
  );
}
