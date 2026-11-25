import { useState } from 'react';
import { assetUrl } from '../data';
import { fileName } from '../lib/sessions';
import { LuExternalLink } from 'react-icons/lu';

interface PdfViewerProps {
  files: string[];
  title: string;
  /** Część (indeks pliku) i strona, od której zacząć – np. strona z zadaniem. */
  initialPart?: number;
  initialPage?: number;
}

/**
 * Podgląd PDF wbudowaną przeglądarką plików. Gdy jest kilka części arkusza,
 * można się między nimi przełączać. Zawsze jest też link „otwórz w nowej karcie”
 * (na telefonach wbudowany podgląd bywa niedostępny).
 */
export function PdfViewer({ files, title, initialPart = 0, initialPage }: PdfViewerProps) {
  const [active, setActive] = useState(() =>
    initialPart >= 0 && initialPart < files.length ? initialPart : 0,
  );
  const current = files[active];
  if (!current) return <p className="muted">Brak pliku PDF.</p>;
  // Fragment #page=N rozumieją wbudowane przeglądarki PDF (Chrome, Firefox, Edge, Safari).
  const page = active === initialPart && initialPage ? initialPage : undefined;
  const src = page ? `${assetUrl(current)}#page=${page}` : assetUrl(current);

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
        {page && <span className="muted pdf-viewer__page">strona {page}</span>}
        <a href={src} target="_blank" rel="noopener" className="button button--ghost">
          Otwórz {fileName(current)} <LuExternalLink aria-hidden className="icon" />
        </a>
      </div>
      <iframe
        key={src}
        className="pdf-viewer__frame"
        src={src}
        title={`${title} – część ${active + 1}`}
      />
    </div>
  );
}
