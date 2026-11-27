/**
 * Wizualizacje algorytmów: każdy algorytm zamienia dane wejściowe na listę klatek.
 * Klatka to stan do narysowania (tablica, drzewo, siatka, tekst, tabela, wieże),
 * numer podświetlonej linii kodu i opis kroku.
 */

/** Rola elementu w klatce – decyduje o kolorze. */
export type Role =
  'compare' | 'swap' | 'sorted' | 'pivot' | 'found' | 'active' | 'muted' | 'min' | 'max';

export interface ArrayView {
  kind: 'array';
  values: number[];
  roles?: Partial<Record<number, Role>>;
  /** Wskaźniki pod tablicą, np. `{ i: 2, j: 3 }`. */
  pointers?: Record<string, number>;
  /** Druga tablica (np. pomocnicza przy scalaniu albo liczniki). */
  aux?: {
    label: string;
    values: (number | null)[];
    offset?: number;
    roles?: Partial<Record<number, Role>>;
  };
}

export interface TreeNode {
  id: number;
  parent: number | null;
  label: string;
  result?: string;
  state: 'active' | 'waiting' | 'done';
}

export interface TreeView {
  kind: 'tree';
  nodes: TreeNode[];
}

export interface GridView {
  kind: 'grid';
  cells: { value: number; state: 'none' | 'current' | 'prime' | 'crossed' | 'marking' }[];
}

export interface TextRow {
  label?: string;
  chars: string[];
  roles?: Partial<Record<number, Role>>;
  /** Przesunięcie wiersza względem pierwszego (np. wzorzec pod tekstem). */
  offset?: number;
}

export interface TextView {
  kind: 'text';
  rows: TextRow[];
}

export interface TableView {
  kind: 'table';
  head: string[];
  rows: (string | number)[][];
  /** Wiersz bieżący (podświetlony). */
  current?: number;
}

export interface HanoiView {
  kind: 'hanoi';
  pegs: number[][];
  n: number;
}

export type View = ArrayView | TreeView | GridView | TextView | TableView | HanoiView;

export interface Frame {
  view: View;
  /** Numer linii kodu (od 0) albo -1. */
  line: number;
  note: string;
  vars?: Record<string, string | number>;
}

export type InputValue = number | number[] | string;

export interface InputField {
  name: string;
  label: string;
  kind: 'int' | 'ints' | 'text';
  default: InputValue;
  min?: number;
  max?: number;
  /** Dla `ints`: dopuszczalna długość listy. */
  minLength?: number;
  maxLength?: number;
}

export type AlgorithmCategory =
  | 'Sortowanie'
  | 'Wyszukiwanie'
  | 'Liczby'
  | 'Rekurencja'
  | 'Teksty'
  | 'Metody numeryczne'
  | 'Algorytmy zachłanne';

export interface AlgorithmDef {
  id: string;
  title: string;
  category: AlgorithmCategory;
  /** Krótki opis (akapity, `kod`, **pogrubienie**). */
  intro: string[];
  complexity: string;
  /** Kod w Pythonie – linie wskazywane przez `Frame.line`. */
  code: string[];
  inputs: InputField[];
  run: (input: Record<string, InputValue>) => Frame[];
}
