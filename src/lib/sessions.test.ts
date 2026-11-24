import { describeSession, fileName, sortSessions } from './sessions';
import type { ExamSession } from '../types';

describe('describeSession', () => {
  it.each([
    ['maj', 'glowna', 'Maj'],
    ['czerwiec', 'dodatkowa', 'Czerwiec (dodatkowa)'],
    ['lipiec', 'dodatkowa', 'Lipiec (dodatkowa)'],
    ['probna-CKE-grudzien', 'probna', 'Próbna CKE – grudzień'],
    [
      'probna-Politechnika-Lodzka-pazdziernik',
      'probna',
      'Próbna Politechniki Łódzkiej – październik',
    ],
    ['stara-formula-czerwiec', 'stara-formula', 'Stara formuła – czerwiec'],
    ['przykladowy-arkusz-CKE', 'przykladowa', 'Przykładowy arkusz CKE'],
  ])('%s → %s / %s', (slug, kind, label) => {
    expect(describeSession(slug)).toEqual({ kind, label });
  });
});

describe('sortSessions', () => {
  const make = (id: string, kind: ExamSession['kind']): ExamSession => ({
    id,
    year: Number(id.slice(0, 4)),
    slug: id.slice(5),
    kind,
    label: id,
    sheets: [],
    answers: [],
    attachments: [],
  });

  it('układa sesje od najnowszego roku, a w roku: główna, dodatkowa, stara formuła, próbna', () => {
    const sorted = sortSessions([
      make('2023/maj', 'glowna'),
      make('2024/probna-CKE-grudzien', 'probna'),
      make('2024/czerwiec', 'dodatkowa'),
      make('2024/maj', 'glowna'),
      make('2024/stara-formula-maj', 'stara-formula'),
    ]);
    expect(sorted.map((s) => s.id)).toEqual([
      '2024/maj',
      '2024/czerwiec',
      '2024/stara-formula-maj',
      '2024/probna-CKE-grudzien',
      '2023/maj',
    ]);
  });
});

test('fileName zwraca ostatni człon ścieżki', () => {
  expect(fileName('arkusze/2024/maj/pliki/liczby.txt')).toBe('liczby.txt');
  expect(fileName('plik.txt')).toBe('plik.txt');
});
