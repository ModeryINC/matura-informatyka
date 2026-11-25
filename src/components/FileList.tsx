import { useState } from 'react';
import { assetUrl } from '../data';
import { fileName } from '../lib/sessions';
import { FilePreviewDialog } from './FilePreviewDialog';

interface FileListProps {
  files: string[];
  /** Pliki z danymi: otwierane w oknie podglądu (z przyciskiem pobierania). */
  preview?: boolean;
}

/** Lista plików: PDF otwiera się w nowej karcie, pliki z danymi – w oknie podglądu. */
export function FileList({ files, preview = false }: FileListProps) {
  const [opened, setOpened] = useState<string | null>(null);

  return (
    <>
      <ul className="file-list">
        {files.map((path) => (
          <li key={path}>
            {preview ? (
              <button type="button" className="file-list__open" onClick={() => setOpened(path)}>
                {fileName(path)}
              </button>
            ) : (
              <a href={assetUrl(path)} target="_blank" rel="noopener">
                {fileName(path)}
              </a>
            )}
          </li>
        ))}
      </ul>
      {preview && <FilePreviewDialog path={opened} onClose={() => setOpened(null)} />}
    </>
  );
}
