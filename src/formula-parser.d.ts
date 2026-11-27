/** Minimalne typy parsera formuł arkusza (używany w testach „Podstaw Excela”). */
declare module '@fortune-sheet/formula-parser' {
  export class Parser {
    parse(formula: string): { result: unknown; error: string | null };
    on(event: string, listener: (...args: never[]) => void): this;
    setFunction(name: string, fn: (params: unknown[]) => unknown): this;
  }
}
