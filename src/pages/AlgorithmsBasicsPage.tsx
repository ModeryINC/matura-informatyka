import { Link } from 'react-router';
import { AlgorithmPlayer } from '../components/AlgorithmPlayer';
import { BasicsLayout } from '../components/BasicsLayout';
import { ALGORITHMS } from '../lib/algorithms';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/** Podstrona z algorytmami: interaktywny przebieg każdego algorytmu krok po kroku. */
export function AlgorithmsBasicsPage() {
  useDocumentTitle('Podstawy algorytmiki');
  return (
    <BasicsLayout
      title="Podstawy algorytmiki"
      lead={
        <p>
          Algorytmy z podstawy programowej – sortowanie, wyszukiwanie, algorytmy na liczbach i
          tekstach, rekurencja, metody numeryczne i zachłanne. Każdy możesz przejść krok po kroku
          (przyciski albo strzałki ← →) albo odtworzyć jak animację, na własnych danych; obok widać,
          która linia kodu właśnie się wykonuje. Potem napisz go sam w{' '}
          <Link to="/zadania/python">zadaniach z Pythona</Link>.
        </p>
      }
      sections={ALGORITHMS.map((algorithm) => ({ ...algorithm, tips: undefined, algorithm }))}
      renderExamples={({ algorithm }) => (
        <>
          <p className="algo__meta">
            <span className="algo__category">{algorithm.category}</span>
            <span>
              <strong>Złożoność:</strong> {algorithm.complexity}
            </span>
          </p>
          <AlgorithmPlayer algorithm={algorithm} />
        </>
      )}
    />
  );
}
