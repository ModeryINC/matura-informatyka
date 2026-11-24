import type { ExamSession, SessionKind } from '../types';

const MONTHS: Record<string, string> = {
  styczen: 'styczeń',
  luty: 'luty',
  marzec: 'marzec',
  kwiecien: 'kwiecień',
  maj: 'maj',
  czerwiec: 'czerwiec',
  lipiec: 'lipiec',
  sierpien: 'sierpień',
  wrzesien: 'wrzesień',
  pazdziernik: 'październik',
  listopad: 'listopad',
  grudzien: 'grudzień',
};

const monthName = (slug: string): string => MONTHS[slug] ?? slug;

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * Rozpoznaje rodzaj sesji i tworzy czytelną etykietę na podstawie nazwy folderu.
 *
 * @example
 * describeSession('maj')                      // { kind: 'glowna', label: 'Maj' }
 * describeSession('probna-CKE-grudzien')      // { kind: 'probna', label: 'Próbna CKE – grudzień' }
 * describeSession('stara-formula-czerwiec')   // { kind: 'stara-formula', label: 'Stara formuła – czerwiec' }
 */
export function describeSession(slug: string): { kind: SessionKind; label: string } {
  if (slug === 'maj') return { kind: 'glowna', label: 'Maj' };
  if (slug === 'przykladowy-arkusz-CKE') {
    return { kind: 'przykladowa', label: 'Przykładowy arkusz CKE' };
  }
  const probnaCke = /^probna-CKE-(\w+)$/.exec(slug);
  if (probnaCke) return { kind: 'probna', label: `Próbna CKE – ${monthName(probnaCke[1]!)}` };
  const probnaPl = /^probna-Politechnika-Lodzka-(\w+)$/.exec(slug);
  if (probnaPl) {
    return { kind: 'probna', label: `Próbna Politechniki Łódzkiej – ${monthName(probnaPl[1]!)}` };
  }
  const stara = /^stara-formula-(\w+)$/.exec(slug);
  if (stara) return { kind: 'stara-formula', label: `Stara formuła – ${monthName(stara[1]!)}` };
  if (slug in MONTHS)
    return { kind: 'dodatkowa', label: `${capitalize(monthName(slug))} (dodatkowa)` };
  return { kind: 'glowna', label: capitalize(slug) };
}

export const SESSION_KIND_LABELS: Record<SessionKind, string> = {
  glowna: 'Główna (maj)',
  dodatkowa: 'Dodatkowa',
  probna: 'Próbna',
  przykladowa: 'Przykładowa',
  'stara-formula': 'Stara formuła',
};

const KIND_ORDER: SessionKind[] = ['glowna', 'dodatkowa', 'stara-formula', 'probna', 'przykladowa'];

/** Sortuje sesje: najnowszy rok na górze, w obrębie roku według rodzaju. */
export function sortSessions(sessions: ExamSession[]): ExamSession[] {
  return [...sessions].sort(
    (a, b) =>
      b.year - a.year ||
      KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
      a.label.localeCompare(b.label, 'pl'),
  );
}

/** Nazwa pliku z pełnej ścieżki. */
export const fileName = (path: string): string => path.slice(path.lastIndexOf('/') + 1);
