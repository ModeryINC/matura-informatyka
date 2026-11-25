/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Adres pośrednika podpowiedzi AI (Cloudflare Worker); brak = podpowiedzi wyłączone. */
  readonly VITE_AI_ENDPOINT?: string;
}

declare module '*.py?raw' {
  const source: string;
  export default source;
}
