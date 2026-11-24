import { describeSession, sortSessions } from '../src/lib/sessions.ts';
import type { ExamSession } from '../src/types.ts';

/** Lista ścieżek plików względem katalogu `public/`, np. `arkusze/2024/maj/arkusz/a.pdf`. */
export type FileList = string[];

const SESSION_FILE = /^arkusze\/(\d{4})\/([^/]+)\/(arkusz|odpowiedzi|pliki)\/(.+)$/;

/**
 * Buduje katalog sesji na podstawie listy plików w `public/arkusze`.
 * Funkcja jest czysta (nie dotyka systemu plików), dzięki czemu łatwo ją testować.
 */
export function buildCatalog(files: FileList): ExamSession[] {
  const sessions = new Map<string, ExamSession>();

  for (const path of files) {
    const match = SESSION_FILE.exec(path);
    if (!match) continue;
    const [, yearText, slug, section] = match as unknown as [string, string, string, string];
    const id = `${yearText}/${slug}`;
    let session = sessions.get(id);
    if (!session) {
      session = {
        id,
        year: Number(yearText),
        slug,
        ...describeSession(slug),
        sheets: [],
        answers: [],
        attachments: [],
      };
      sessions.set(id, session);
    }
    if (section === 'arkusz') session.sheets.push(path);
    else if (section === 'odpowiedzi') session.answers.push(path);
    else session.attachments.push(path);
  }

  for (const session of sessions.values()) {
    session.sheets.sort(comparePaths);
    session.answers.sort(comparePaths);
    session.attachments.sort(comparePaths);
  }

  return sortSessions([...sessions.values()]);
}

/** Sortowanie, w którym `arkusz.pdf` jest przed `arkusz-2.pdf`. */
function comparePaths(a: string, b: string): number {
  const strip = (p: string) => p.replace(/\.[^.]+$/, '');
  return strip(a).localeCompare(strip(b), 'pl', { numeric: true });
}
