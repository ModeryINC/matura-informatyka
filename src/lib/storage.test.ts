import type { SubmissionResult } from '../types';
import {
  loadSolution,
  removeSolution,
  saveSolution,
  solutionStatus,
  subscribeSolutions,
} from './storage';

const result = (passed: boolean): SubmissionResult => ({ passed, results: [], durationMs: 5 });

describe('storage', () => {
  it('zwraca null dla nieznanego zadania', () => {
    expect(loadSolution('x')).toBeNull();
    expect(solutionStatus('x')).toBe('nowe');
  });

  it('zapisuje kod i wynik', () => {
    saveSolution('t1', { code: 'print(1)' });
    expect(loadSolution('t1')).toMatchObject({ code: 'print(1)', passed: false });
    expect(solutionStatus('t1')).toBe('rozpoczete');

    saveSolution('t1', { code: 'print(2)', lastResult: result(true) });
    expect(loadSolution('t1')).toMatchObject({ code: 'print(2)', passed: true, everPassed: true });
    expect(solutionStatus('t1')).toBe('zaliczone');
  });

  it('pamięta zaliczenie mimo późniejszej błędnej wersji', () => {
    saveSolution('t2', { code: 'a', lastResult: result(true) });
    saveSolution('t2', { code: 'b', lastResult: result(false) });
    expect(loadSolution('t2')).toMatchObject({ passed: false, everPassed: true });
  });

  it('zachowuje ostatni wynik przy zapisie samego kodu', () => {
    saveSolution('t3', { code: 'a', lastResult: result(true) });
    saveSolution('t3', { code: 'b' });
    expect(loadSolution('t3')?.lastResult?.passed).toBe(true);
  });

  it('usuwa rozwiązanie i powiadamia subskrybentów', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSolutions(listener);
    saveSolution('t4', { code: 'a' });
    removeSolution('t4');
    expect(loadSolution('t4')).toBeNull();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    saveSolution('t4', { code: 'a' });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('ignoruje uszkodzone dane', () => {
    localStorage.setItem('matura-inf:solution:bad', '{nie json');
    expect(loadSolution('bad')).toBeNull();
  });
});
