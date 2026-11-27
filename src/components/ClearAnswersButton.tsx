import { LuEraser } from 'react-icons/lu';

/** „Wyczyść odpowiedzi” z potwierdzeniem – kasuje zapisane w przeglądarce odpowiedzi zadania. */
export function ClearAnswersButton({
  onClear,
  disabled,
}: {
  onClear: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="button button--ghost"
      disabled={disabled}
      onClick={() => {
        if (window.confirm('Wyczyścić wszystkie odpowiedzi w tym zadaniu?')) onClear();
      }}
    >
      <LuEraser aria-hidden className="icon" /> Wyczyść odpowiedzi
    </button>
  );
}
