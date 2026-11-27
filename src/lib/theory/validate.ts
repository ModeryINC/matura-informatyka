/** Walidacja zadań testowych (`src/data/theory/*.json`). */
const isString = (value: unknown): value is string => typeof value === 'string' && value !== '';

export function validateTheoryTask(task: unknown, sessionIds: Set<string>): string[] {
  if (typeof task !== 'object' || task === null) return ['zadanie nie jest obiektem'];
  const t = task as Record<string, unknown>;
  const id = isString(t.id) ? t.id : '?';
  const errors: string[] = [];
  for (const key of ['id', 'sessionId', 'number', 'title'] as const)
    if (!isString(t[key])) errors.push(`${id}: brak pola "${key}"`);
  if (isString(t.sessionId) && !sessionIds.has(t.sessionId))
    errors.push(`${id}: nieznana sesja "${t.sessionId}"`);
  if (!Array.isArray(t.parts) || t.parts.length === 0) {
    errors.push(`${id}: zadanie wymaga listy "parts"`);
    return errors;
  }
  const numbers = new Set<string>();
  for (const raw of t.parts as unknown[]) {
    const part = (raw ?? {}) as Record<string, unknown>;
    const label = `${id} ${isString(part.number) ? part.number : '?'}`;
    if (!isString(part.number)) errors.push(`${label}: brak numeru`);
    else if (numbers.has(part.number)) errors.push(`${label}: powtórzony numer`);
    else numbers.add(part.number);
    if (!isString(part.prompt)) errors.push(`${label}: brak treści "prompt"`);
    const statements = part.statements;
    if (!Array.isArray(statements) || statements.length < 2 || !statements.every(isString))
      errors.push(`${label}: "statements" musi mieć co najmniej dwa zdania`);
    if (!isString(part.answers) || !/^[PF]+$/.test(part.answers))
      errors.push(`${label}: "answers" to ciąg liter P i F`);
    else if (Array.isArray(statements) && part.answers.length !== statements.length)
      errors.push(`${label}: tyle odpowiedzi, ile zdań`);
  }
  return errors;
}
