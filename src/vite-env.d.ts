/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Klucz Gemini API (wstawiany przy buildzie; brak = podpowiedzi AI wyłączone). */
  readonly VITE_AI_API_KEY?: string;
  /** Opcjonalna zmiana modelu, np. `gemini-3.8-flash`. */
  readonly VITE_AI_MODEL?: string;
}

declare module '*.py?raw' {
  const source: string;
  export default source;
}
