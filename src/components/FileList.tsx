import { assetUrl } from '../data';
import { fileName } from '../lib/sessions';

interface FileListProps {
  files: string[];
  /** Pobieranie zamiast otwierania w nowej karcie. */
  download?: boolean;
}

/** Lista plików z linkami (PDF otwiera się w nowej karcie, dane są pobierane). */
export function FileList({ files, download = false }: FileListProps) {
  return (
    <ul className="file-list">
      {files.map((path) => (
        <li key={path}>
          <a
            href={assetUrl(path)}
            {...(download ? { download: fileName(path) } : { target: '_blank', rel: 'noopener' })}
          >
            {fileName(path)}
          </a>
        </li>
      ))}
    </ul>
  );
}
