import { validateTask } from './validate';

const sessions = new Set(['2024/maj']);

const programTask = {
  id: '2024-maj-1.1',
  sessionId: '2024/maj',
  number: '1.1',
  title: 'Test',
  part: 2,
  points: 2,
  topics: ['napisy'],
  summary: 'Opis',
  starterCode: '',
  kind: 'program',
  checks: [{ label: 'Dane', files: { 'a.txt': 'arkusze/2024/maj/pliki/a.txt' }, expected: '1' }],
};

const functionTask = {
  ...programTask,
  id: '2024-maj-1.2',
  kind: 'function',
  functionName: 'policz',
  tests: [{ args: [1], expected: 2 }],
  checks: undefined,
};

describe('validateTask', () => {
  it('akceptuje poprawne zadania obu typów', () => {
    expect(validateTask(programTask, sessions)).toEqual([]);
    expect(validateTask(functionTask, sessions)).toEqual([]);
  });

  it('odrzuca nie-obiekty', () => {
    expect(validateTask(null, sessions)).toEqual(['zadanie nie jest obiektem']);
  });

  it('wykrywa nieznaną sesję i temat', () => {
    const errors = validateTask(
      { ...programTask, sessionId: '1999/maj', topics: ['magia'] },
      sessions,
    );
    expect(errors).toEqual([
      '2024-maj-1.1: nieznana sesja "1999/maj"',
      '2024-maj-1.1: nieznany temat "magia"',
    ]);
  });

  it('wymaga testów i poprawnych plików', () => {
    expect(validateTask({ ...programTask, checks: [] }, sessions)).toHaveLength(1);
    const badFiles = {
      ...programTask,
      checks: [{ label: 'x', files: { 'a/b.txt': '/etc' }, expected: '1' }],
    };
    expect(validateTask(badFiles, sessions)).toEqual([
      '2024-maj-1.1: checks[0].files: niepoprawny wpis "a/b.txt"',
    ]);
  });

  it('sprawdza nazwę funkcji i rodzaj zadania', () => {
    expect(validateTask({ ...functionTask, functionName: '1abc' }, sessions)).toHaveLength(1);
    expect(validateTask({ ...programTask, kind: 'quiz' }, sessions)).toEqual([
      '2024-maj-1.1: pole "kind" musi mieć wartość "program" lub "function"',
    ]);
  });
});
