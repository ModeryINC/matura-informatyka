/** Usuwa polskie znaki diakrytyczne i zamienia na małe litery – do wyszukiwania. */
export function foldText(text: string): string {
  return text.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '');
}
