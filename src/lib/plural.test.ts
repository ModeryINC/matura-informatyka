import { plural } from './plural';

test.each([
  [1, 'podpunkt'],
  [2, 'podpunkty'],
  [4, 'podpunkty'],
  [5, 'podpunktów'],
  [12, 'podpunktów'],
  [22, 'podpunkty'],
  [0, 'podpunktów'],
])('%i %s', (count, word) => {
  expect(plural(count, 'podpunkt', 'podpunkty', 'podpunktów')).toBe(word);
});
