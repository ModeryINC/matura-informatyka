import { useState } from 'react';
import { assetUrl } from '../data';
import { fileName } from '../lib/sessions';

interface PdfViewerProps {
  files: string[];
  title: string;
}

/**
 * Podgląd PDF wbudowaną przeglądarką plików. Gdy jest kilka części arkusza,
 * można się między nimi przełączać. Zawsze jest też link „otwórz w nowej karcie”
 * (na telefonach wbudowany podgląd bywa niedostępny).
 */
export function PdfViewer({ files, title }: PdfViewerProps) {
  const [active, setActive] = useState(0);
  const current = files[active];
  if (!current) return <p className="muted">Brak pliku PDF.</p>;

  return (
    <div className="pdf-viewer">
      <div className="pdf-viewer__toolbar">
        {files.length > 1 && (
          <div role="group" aria-label="Część dokumentu" className="segmented">
            {files.map((file, i) => (
              <button
                key={file}
                type="button"
                aria-pressed={i === active}
                onClick={() => setActive(i)}
              >
                Część {i + 1}
              </button>
            ))}
          </div>
        )}
        <a href={assetUrl(current)} target="_blank" rel="noopener" className="button button--ghost">
          Otwórz {fileName(current)} ↗
        </a>
      </div>
      <iframe
        className="pdf-viewer__frame"
        src={assetUrl(current)}
        title={`${title} – część ${active + 1}`}
      />
    </div>
  );
}
