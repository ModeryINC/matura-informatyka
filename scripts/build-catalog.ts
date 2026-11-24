/**
 * Generuje `src/data/catalog.generated.json` – listę sesji egzaminacyjnych
 * na podstawie zawartości katalogu `public/arkusze`.
 *
 * Uruchamiany automatycznie przed `dev` i `build` (`npm run catalog`).
 */
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCatalog } from './catalog-lib.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
const outFile = join(root, 'src', 'data', 'catalog.generated.json');

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [relative(publicDir, full).split(sep).join('/')];
  });
}

const catalog = buildCatalog(walk(join(publicDir, 'arkusze')));
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`catalog: zapisano ${catalog.length} sesji do ${relative(root, outFile)}`);
