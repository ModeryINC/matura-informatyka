import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function HelpPage() {
  useDocumentTitle('Pomoc');
  return (
    <div className="page page--narrow prose">
      <h1>Jak to działa?</h1>
      <h2>Dwa rodzaje zadań</h2>
      <ul>
        <li>
          <strong>Program</strong> (głównie część 2) – piszesz pełny program, który czyta plik z
          danymi (np. <code>open("liczby.txt")</code>) i wypisuje odpowiedź przez <code>print</code>
          . Program jest uruchamiany na danych przykładowych z arkusza oraz na pełnych danych z
          matury.
        </li>
        <li>
          <strong>Funkcja</strong> (głównie część 1) – zadania typu „zapisz algorytm”. Definiujesz
          funkcję o podanej nazwie, a sprawdzarka wywołuje ją z różnymi argumentami.
        </li>
      </ul>
      <h2>Zadania z Excela</h2>
      <p>
        W zakładce Zadania → Excel są zadania z arkusza kalkulacyjnego (arkusze 2018–2026). Dane z
        plików są już wczytane – każdy plik w osobnej karcie. Formuły piszesz i widzisz po polsku,
        jak w polskim Excelu (<code>=SUMA.JEŻELI(B2:B100;"Z";E2:E100)</code>) – także w pasku
        formuły, w edytorze komórki i w podpowiedziach funkcji. Formuły po angielsku też działają.
        Odpowiedź wpisz albo zaznacz komórki w arkuszu i kliknij „Wstaw z zaznaczenia”. Liczby
        całkowite muszą się zgadzać dokładnie, ułamki – z dokładnością klucza; daty można zapisać
        jako <code>2035-12-13</code> lub <code>13.12.2035</code>. Wykresy zrób w Excelu – nie są
        sprawdzane. Przyciskiem „Eksportuj do .xlsx” zapiszesz arkusz razem z formułami (np. żeby
        zrobić wykres w Excelu), a „Importuj z .xlsx” wczyta skoroszyt z powrotem – z wartościami,
        formułami, datami i pogrubieniem; wykresy i scalenia komórek z pliku są pomijane.
      </p>
      <h2>Jak porównywany jest wynik?</h2>
      <ul>
        <li>wielkość liter, dodatkowe spacje i puste linie nie mają znaczenia,</li>
        <li>przecinek dziesiętny jest równoważny kropce,</li>
        <li>
          możesz dopisywać opisy, np. <code>print("Odpowiedź:", wynik)</code> – liczy się, czy w
          wyjściu (w kolejnych liniach) pojawiają się wszystkie elementy odpowiedzi,
        </li>
        <li>liczby muszą się zgadzać dokładnie – zaokrąglaj tak, jak każe polecenie.</li>
      </ul>
      <h2>Gdzie jest mój kod?</h2>
      <p>
        Strona nie ma serwera. Python (Pyodide) działa w Twojej przeglądarce, a rozwiązania zapisują
        się w jej pamięci lokalnej – na innym komputerze ich nie zobaczysz. Wyczyszczenie danych
        witryny usuwa rozwiązania.
      </p>
      <h2>Skróty</h2>
      <ul>
        <li>
          <kbd>Ctrl</kbd> + <kbd>Enter</kbd> – sprawdź rozwiązanie,
        </li>
        <li>
          <kbd>Ctrl</kbd> + <kbd>S</kbd> – pobierz rozwiązanie jako plik <code>.py</code> (zamiast
          zapisywać stronę),
        </li>
        <li>
          <kbd>Tab</kbd> w edytorze zatwierdza podpowiedź (gdy lista jest otwarta), a w innym
          wypadku wstawia wcięcie; <kbd>Esc</kbd>, a potem <kbd>Tab</kbd> – wyjście z edytora.
        </li>
      </ul>
      <h2>Źródła</h2>
      <p>
        Arkusze, klucze odpowiedzi i pliki z danymi pochodzą od CKE i Politechniki Łódzkiej (przez
        serwis arkusze.pl). Streszczenia zadań i testy do funkcji zostały przygotowane na potrzeby
        tej strony – pełna treść zadań jest zawsze w arkuszu PDF.
      </p>
    </div>
  );
}
