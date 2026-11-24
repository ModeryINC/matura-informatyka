import { TOPICS, type Task } from '../types';

/**
 * Sprawdza poprawność opisu zadania wczytanego z JSON.
 * Zwraca listę błędów (pusta lista = zadanie poprawne).
 *
 * Walidacja działa w testach (`src/data/tasks.test.ts`), więc literówka
 * w pliku z zadaniami zatrzyma CI, zanim trafi na stronę.
 */
export function validateTask(value: unknown, sessionIds: ReadonlySet<string>): string[] {
  const errors: string[] = [];
  if (typeof value !== 'object' || value === null) return ['zadanie nie jest obiektem'];
  const task = value as Record<string, unknown>;
  const where = typeof task.id === 'string' ? task.id : '(bez id)';
  const fail = (message: string) => errors.push(`${where}: ${message}`);

  for (const field of ['id', 'sessionId', 'number', 'title', 'summary', 'starterCode'] as const) {
    if (typeof task[field] !== 'string' || (field !== 'starterCode' && task[field] === '')) {
      fail(`pole "${field}" musi być niepustym tekstem`);
    }
  }
  if (typeof task.sessionId === 'string' && !sessionIds.has(task.sessionId)) {
    fail(`nieznana sesja "${task.sessionId}"`);
  }
  if (task.part !== 1 && task.part !== 2) fail('pole "part" musi mieć wartość 1 lub 2');
  if (typeof task.points !== 'number' || task.points <= 0)
    fail('pole "points" musi być liczbą > 0');
  if (!Array.isArray(task.topics) || task.topics.length === 0) {
    fail('zadanie musi mieć co najmniej jeden temat');
  } else {
    for (const topic of task.topics) {
      if (typeof topic !== 'string' || !(topic in TOPICS))
        fail(`nieznany temat "${String(topic)}"`);
    }
  }

  if (task.kind === 'program') {
    if (!Array.isArray(task.checks) || task.checks.length === 0) {
      fail('zadanie typu "program" wymaga listy "checks"');
    } else {
      task.checks.forEach((check: unknown, i: number) => {
        const c = check as Record<string, unknown>;
        if (typeof c.label !== 'string') fail(`checks[${i}].label musi być tekstem`);
        if (typeof c.expected !== 'string' || c.expected.trim() === '') {
          fail(`checks[${i}].expected musi być niepustym tekstem`);
        }
        if (
          c.alternatives !== undefined &&
          (!Array.isArray(c.alternatives) || !c.alternatives.every((a) => typeof a === 'string'))
        ) {
          fail(`checks[${i}].alternatives musi być listą tekstów`);
        }
        if (typeof c.files !== 'object' || c.files === null) {
          fail(`checks[${i}].files musi być obiektem`);
        } else {
          for (const [name, path] of Object.entries(c.files)) {
            if (name.includes('/') || typeof path !== 'string' || !path.startsWith('arkusze/')) {
              fail(`checks[${i}].files: niepoprawny wpis "${name}"`);
            }
          }
        }
      });
    }
  } else if (task.kind === 'function') {
    if (typeof task.functionName !== 'string' || !/^[A-Za-z_]\w*$/.test(task.functionName)) {
      fail('pole "functionName" musi być poprawną nazwą funkcji Pythona');
    }
    if (!Array.isArray(task.tests) || task.tests.length === 0) {
      fail('zadanie typu "function" wymaga listy "tests"');
    } else {
      task.tests.forEach((test: unknown, i: number) => {
        const t = test as Record<string, unknown>;
        if (!Array.isArray(t.args)) fail(`tests[${i}].args musi być listą`);
        if (!('expected' in t)) fail(`tests[${i}] nie ma pola "expected"`);
      });
    }
  } else {
    fail('pole "kind" musi mieć wartość "program" lub "function"');
  }

  return errors;
}

/** Zawężenie typu po pozytywnej walidacji. */
export const isTask = (value: unknown, sessionIds: ReadonlySet<string>): value is Task =>
  validateTask(value, sessionIds).length === 0;
