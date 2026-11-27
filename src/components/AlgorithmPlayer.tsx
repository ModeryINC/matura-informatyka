import { useEffect, useId, useMemo, useState } from 'react';
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
  LuPause,
  LuPlay,
  LuRotateCcw,
} from 'react-icons/lu';
import { formatInput, parseInput } from '../lib/algorithms';
import type {
  AlgorithmDef,
  ArrayView,
  Frame,
  GridView,
  HanoiView,
  InputValue,
  TableView,
  TextView,
  TreeNode,
  TreeView,
  View,
} from '../lib/algorithms/types';

const SPEEDS = [
  { label: '0,5×', ms: 1600 },
  { label: '1×', ms: 800 },
  { label: '2×', ms: 400 },
  { label: '4×', ms: 200 },
];

const defaultsOf = (algorithm: AlgorithmDef) =>
  Object.fromEntries(algorithm.inputs.map((f) => [f.name, f.default])) as Record<
    string,
    InputValue
  >;

/**
 * Odtwarzacz wizualizacji algorytmu: dane wejściowe, krokowanie (także
 * automatyczne), widok stanu, kod z podświetloną linią i opis kroku.
 */
export function AlgorithmPlayer({ algorithm }: { algorithm: AlgorithmDef }) {
  const id = useId();
  const [input, setInput] = useState(() => defaultsOf(algorithm));
  const [texts, setTexts] = useState(() =>
    Object.fromEntries(algorithm.inputs.map((f) => [f.name, formatInput(f.default)])),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const frames = useMemo(() => algorithm.run(input), [algorithm, input]);
  const layout = useMemo(() => reserveLayout(frames), [frames]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const frame = frames[Math.min(step, frames.length - 1)]!;
  const atEnd = step >= frames.length - 1;

  // Odtwarzanie samo się kończy na ostatnim kroku (bez ustawiania stanu w efekcie).
  const running = playing && !atEnd;
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setStep((s) => s + 1), SPEEDS[speed]!.ms);
    return () => clearTimeout(timer);
  }, [running, step, speed]);

  const apply = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, InputValue> = {};
    const nextErrors: Record<string, string> = {};
    for (const field of algorithm.inputs) {
      const parsed = parseInput(field, texts[field.name] ?? '');
      if ('error' in parsed) nextErrors[field.name] = parsed.error;
      else next[field.name] = parsed.value;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setInput(next);
    setStep(0);
    setPlaying(false);
  };

  const clamp = (to: number) => Math.max(0, Math.min(frames.length - 1, to));
  const go = (to: number) => {
    setPlaying(false);
    setStep(clamp(to));
  };
  /** Krok w przód / w tył – liczony od aktualnego stanu (szybkie kliknięcia się sumują). */
  const goBy = (delta: number) => {
    setPlaying(false);
    setStep((s) => clamp(s + delta));
  };

  return (
    <div
      className="algo"
      onKeyDown={(event) => {
        const target = event.target as HTMLElement;
        if (target.matches('input, select, textarea')) return;
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          goBy(1);
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goBy(-1);
        }
      }}
    >
      <form className="algo__inputs" onSubmit={apply}>
        {algorithm.inputs.map((field) => (
          <div key={field.name} className="field">
            <label htmlFor={`${id}-${field.name}`}>{field.label}</label>
            <input
              id={`${id}-${field.name}`}
              value={texts[field.name] ?? ''}
              onChange={(e) => setTexts((t) => ({ ...t, [field.name]: e.target.value }))}
              inputMode={field.kind === 'text' ? 'text' : 'numeric'}
              spellCheck={false}
              autoComplete="off"
              aria-invalid={errors[field.name] ? true : undefined}
              aria-describedby={errors[field.name] ? `${id}-${field.name}-err` : undefined}
            />
            {errors[field.name] && (
              <span id={`${id}-${field.name}-err`} className="field__error">
                {errors[field.name]}
              </span>
            )}
          </div>
        ))}
        <button type="submit" className="button button--small">
          <LuRotateCcw aria-hidden className="icon" /> Zastosuj dane
        </button>
      </form>

      <div className="algo__stage">
        <div className="algo__view">
          <FrameView view={frame.view} layout={layout} />
        </div>
        <p className="algo__note" aria-live="polite">
          <strong>
            Krok {step + 1}/{frames.length}:
          </strong>{' '}
          {frame.note}
        </p>
        <p className="algo__vars">
          {Object.entries(frame.vars ?? {}).map(([name, value]) => (
            <code key={name}>
              {name} = {value}
            </code>
          ))}
        </p>
      </div>

      <div className="algo__controls" role="group" aria-label="Sterowanie animacją">
        <button
          type="button"
          className="icon-button"
          onClick={() => go(0)}
          aria-label="Na początek"
        >
          <LuChevronsLeft aria-hidden className="icon" />
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => goBy(-1)}
          disabled={step === 0}
          aria-label="Poprzedni krok"
        >
          <LuChevronLeft aria-hidden className="icon" />
        </button>
        <button
          type="button"
          className="button button--primary button--small"
          onClick={() => {
            if (atEnd) {
              setStep(0);
              setPlaying(true);
            } else setPlaying(!running);
          }}
        >
          {running ? (
            <>
              <LuPause aria-hidden className="icon" /> Pauza
            </>
          ) : (
            <>
              <LuPlay aria-hidden className="icon" /> {atEnd ? 'Od nowa' : 'Odtwórz'}
            </>
          )}
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => goBy(1)}
          disabled={atEnd}
          aria-label="Następny krok"
        >
          <LuChevronRight aria-hidden className="icon" />
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => go(frames.length - 1)}
          aria-label="Na koniec"
        >
          <LuChevronsRight aria-hidden className="icon" />
        </button>
        <input
          type="range"
          className="algo__slider"
          min={0}
          max={frames.length - 1}
          value={step}
          onChange={(e) => go(Number(e.target.value))}
          aria-label="Krok animacji"
        />
        <label className="algo__speed">
          <span className="visually-hidden">Tempo</span>
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            {SPEEDS.map((s, i) => (
              <option key={s.label} value={i}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <pre className="algo__code" aria-label="Kod w Pythonie">
        {algorithm.code.map((line, i) => (
          <span
            key={i}
            className={i === frame.line ? 'algo__line is-current' : 'algo__line'}
            aria-current={i === frame.line ? 'step' : undefined}
          >
            {line || ' '}
          </span>
        ))}
      </pre>
    </div>
  );
}

/**
 * Rozmiary zarezerwowane z góry na podstawie wszystkich klatek: kolumny tabel mają
 * szerokość najszerszego wpisu, tablice i teksty – docelową liczbę pól, a drzewo –
 * układ całego, końcowego drzewa. Dzięki temu nic się nie rozsuwa w trakcie animacji.
 */
interface Layout {
  tree: ReturnType<typeof layoutTree> | null;
  columns: number[];
  tableRows: number;
  slots: number;
  auxSlots: number;
  textRows: number;
  textCols: number;
}

function reserveLayout(frames: Frame[]): Layout {
  const layout: Layout = {
    tree: null,
    columns: [],
    tableRows: 0,
    slots: 0,
    auxSlots: 0,
    textRows: 0,
    textCols: 0,
  };
  let lastTree: TreeView | null = null;
  for (const { view } of frames) {
    if (view.kind === 'tree') lastTree = view;
    if (view.kind === 'table') {
      [view.head, ...view.rows].forEach((row) =>
        row.forEach((cell, c) => {
          layout.columns[c] = Math.max(layout.columns[c] ?? 0, String(cell).length);
        }),
      );
      layout.tableRows = Math.max(layout.tableRows, view.rows.length);
    }
    if (view.kind === 'array') {
      layout.slots = Math.max(layout.slots, view.values.length);
      layout.auxSlots = Math.max(layout.auxSlots, view.aux?.values.length ?? 0);
    }
    if (view.kind === 'text') {
      layout.textRows = Math.max(layout.textRows, view.rows.length);
      for (const row of view.rows)
        layout.textCols = Math.max(layout.textCols, row.chars.length + (row.offset ?? 0));
    }
  }
  if (lastTree) layout.tree = layoutTree(lastTree.nodes);
  return layout;
}

function FrameView({ view, layout }: { view: View; layout: Layout }) {
  switch (view.kind) {
    case 'array':
      return <ArrayBars view={view} layout={layout} />;
    case 'tree':
      return <RecursionTree view={view} layout={layout} />;
    case 'grid':
      return <SieveGrid view={view} />;
    case 'text':
      return <TextRows view={view} layout={layout} />;
    case 'table':
      return <StepTable view={view} layout={layout} />;
    case 'hanoi':
      return <Hanoi view={view} />;
  }
}

function ArrayBars({ view, layout }: { view: ArrayView; layout: Layout }) {
  const max = Math.max(1, ...view.values.map(Math.abs));
  const empty = (count: number) => Array.from({ length: Math.max(0, count) }, (_, i) => i);
  const pointers = Object.entries(view.pointers ?? {});
  return (
    <div className="algo-array">
      <ol className="algo-array__bars" aria-label="Tablica">
        {view.values.map((value, i) => (
          <li key={i} className={`algo-bar algo-role--${view.roles?.[i] ?? 'none'}`}>
            <span
              className="algo-bar__fill"
              style={{ blockSize: `${(Math.abs(value) / max) * 100}%` }}
            />
            <span className="algo-bar__value">{value}</span>
            <span className="algo-bar__index" aria-hidden="true">
              {i}
            </span>
            {pointers
              .filter(([, at]) => at === i)
              .map(([name]) => (
                <span key={name} className="algo-bar__pointer">
                  {name}
                </span>
              ))}
          </li>
        ))}
        {empty(layout.slots - view.values.length).map((i) => (
          <li key={`p${i}`} className="algo-bar is-placeholder" aria-hidden="true" />
        ))}
      </ol>
      {!view.aux && layout.auxSlots > 0 && (
        <div className="algo-array__aux is-placeholder" aria-hidden="true">
          <span className="muted">&nbsp;</span>
          <ol>
            <li className="algo-cell" />
          </ol>
        </div>
      )}
      {view.aux && (
        <div className="algo-array__aux">
          <span className="muted">{view.aux.label}:</span>
          <ol>
            {view.aux.values.map((value, i) => (
              <li key={i} className={`algo-cell algo-role--${view.aux?.roles?.[i] ?? 'none'}`}>
                {value ?? ''}
              </li>
            ))}
            {empty(layout.auxSlots - view.aux.values.length).map((i) => (
              <li key={`p${i}`} className="algo-cell is-placeholder" aria-hidden="true" />
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

const NODE_W = 78;
const NODE_H = 40;
const GAP_X = 10;
const LEVEL_H = 70;

/** Prosty układ drzewa: liście po kolei od lewej, rodzic nad środkiem dzieci. */
function layoutTree(nodes: TreeNode[]) {
  const children = new Map<number, number[]>();
  for (const node of nodes)
    if (node.parent !== null)
      children.set(node.parent, [...(children.get(node.parent) ?? []), node.id]);
  const pos = new Map<number, { x: number; y: number }>();
  let leaf = 0;
  const place = (id: number, depth: number): number => {
    const kids = children.get(id) ?? [];
    const x =
      kids.length === 0
        ? leaf++ * (NODE_W + GAP_X)
        : kids.map((k) => place(k, depth + 1)).reduce((a, b) => a + b, 0) / kids.length;
    pos.set(id, { x, y: depth * LEVEL_H });
    return x;
  };
  if (nodes.length > 0) place(0, 0);
  const width = Math.max(1, leaf) * (NODE_W + GAP_X);
  const height = Math.max(...[...pos.values()].map((p) => p.y), 0) + NODE_H;
  return { pos, width, height };
}

function RecursionTree({ view, layout }: { view: TreeView; layout: Layout }) {
  // Pozycje z końcowego drzewa: węzły od początku stoją na swoich miejscach.
  const { pos, width, height } = layout.tree ?? layoutTree(view.nodes);
  return (
    <div className="algo-tree">
      <svg
        viewBox={`-4 -4 ${width + 8} ${height + 8}`}
        style={{ maxInlineSize: `${width + 8}px` }}
        role="img"
        aria-label={`Drzewo wywołań: ${view.nodes.map((n) => n.label + (n.result ? ` = ${n.result}` : '')).join(', ')}`}
      >
        {view.nodes.map((node) => {
          if (node.parent === null) return null;
          const a = pos.get(node.parent)!;
          const b = pos.get(node.id)!;
          return (
            <line
              key={`e${node.id}`}
              className="algo-tree__edge"
              x1={a.x + NODE_W / 2}
              y1={a.y + NODE_H}
              x2={b.x + NODE_W / 2}
              y2={b.y}
            />
          );
        })}
        {view.nodes.map((node) => {
          const p = pos.get(node.id)!;
          return (
            <g
              key={node.id}
              className={`algo-tree__node is-${node.state}`}
              transform={`translate(${p.x} ${p.y})`}
            >
              <rect width={NODE_W} height={NODE_H} rx={8} />
              <text x={NODE_W / 2} y={node.result ? 16 : 24} textAnchor="middle">
                {node.label}
              </text>
              {node.result && (
                <text x={NODE_W / 2} y={33} textAnchor="middle" className="algo-tree__result">
                  = {node.result}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function SieveGrid({ view }: { view: GridView }) {
  return (
    <ol className="algo-grid" aria-label="Liczby">
      {view.cells.map((cell) => (
        <li key={cell.value} className={`algo-grid__cell is-${cell.state}`}>
          {cell.value}
        </li>
      ))}
    </ol>
  );
}

function TextRows({ view, layout }: { view: TextView; layout: Layout }) {
  const width = Math.max(
    layout.textCols,
    ...view.rows.map((r) => r.chars.length + (r.offset ?? 0)),
  );
  const missing = Math.max(0, layout.textRows - view.rows.length);
  return (
    <div className="algo-text" style={{ '--cols': width } as React.CSSProperties}>
      {view.rows.map((row, r) => (
        <div key={r} className="algo-text__row">
          {row.label && <span className="algo-text__label">{row.label}</span>}
          <ol style={{ paddingInlineStart: `calc(${row.offset ?? 0} * var(--cell))` }}>
            {row.chars.map((ch, i) => (
              <li key={i} className={`algo-cell algo-role--${row.roles?.[i] ?? 'none'}`}>
                {ch === ' ' ? '␣' : ch}
                <span className="algo-cell__index" aria-hidden="true">
                  {i + (r === 0 ? 0 : (row.offset ?? 0))}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ))}
      {Array.from({ length: missing }, (_, r) => (
        <div key={`p${r}`} className="algo-text__row is-placeholder" aria-hidden="true">
          <span className="algo-text__label">&nbsp;</span>
          <ol>
            <li className="algo-cell" />
          </ol>
        </div>
      ))}
    </div>
  );
}

function StepTable({ view, layout }: { view: TableView; layout: Layout }) {
  const missing = Math.max(0, layout.tableRows - view.rows.length);
  return (
    <div className="algo-table">
      <table>
        <colgroup>
          {view.head.map((h, c) => (
            <col
              key={h}
              style={{ inlineSize: `calc(${layout.columns[c] ?? h.length}ch + 1.2rem)` }}
            />
          ))}
        </colgroup>
        <thead>
          <tr>
            {view.head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {view.rows.map((row, r) => (
            <tr key={r} className={r === view.current ? 'is-current' : undefined}>
              {row.map((cell, c) => (
                <td key={c}>{cell}</td>
              ))}
            </tr>
          ))}
          {Array.from({ length: missing }, (_, r) => (
            <tr key={`p${r}`} className="is-placeholder" aria-hidden="true">
              <td colSpan={view.head.length}>&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Hanoi({ view }: { view: HanoiView }) {
  return (
    <div className="algo-hanoi" style={{ '--discs': view.n } as React.CSSProperties}>
      {view.pegs.map((peg, p) => (
        <div
          key={p}
          className="algo-hanoi__peg"
          aria-label={`Pręt ${'ABC'[p]}: ${peg.join(', ') || 'pusty'}`}
        >
          <div className="algo-hanoi__stack">
            {peg.map((disc) => (
              <span
                key={disc}
                className="algo-hanoi__disc"
                style={
                  {
                    inlineSize: `${30 + (disc / view.n) * 70}%`,
                    '--hue': disc * 47,
                  } as React.CSSProperties
                }
              >
                {disc}
              </span>
            ))}
          </div>
          <span className="algo-hanoi__name">{'ABC'[p]}</span>
        </div>
      ))}
    </div>
  );
}
