import type { ReactNode } from 'react';

/**
 * Bezpieczne wyświetlanie tekstu z prostym formatowaniem Markdown (odpowiedzi AI,
 * treści zadań otwartych): bloki ``` , `kod`, **pogrubienie**, listy „- ”,
 * tabele `| a | b |` i akapity. Tworzy elementy
 * Reacta (bez `innerHTML`), więc odpowiedź nie może wstrzyknąć HTML-a.
 */
export function HintText({ text, className = 'hint-text' }: { text: string; className?: string }) {
  return <div className={className}>{renderBlocks(text)}</div>;
}

/** Jedna linia tekstu z `kodem` i **pogrubieniem** (bez akapitów). */
export function InlineText({ text }: { text: string }) {
  return <>{renderInline(text, 'i')}</>;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  // Dzielimy na `kod` i **pogrubienie**; reszta to zwykły tekst.
  return text
    .split(/(`[^`\n]+`|\*\*[^*\n]+\*\*)/g)
    .filter(Boolean)
    .map((part, i) => {
      const key = `${keyPrefix}-${i}`;
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2)
        return <code key={key}>{part.slice(1, -1)}</code>;
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
        return <strong key={key}>{part.slice(2, -2)}</strong>;
      return part;
    });
}

function renderBlocks(text: string): ReactNode[] {
  const blocks: ReactNode[] = [];
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      const key = `p${blocks.length}`;
      blocks.push(<p key={key}>{renderInline(paragraph.join(' '), key)}</p>);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      const key = `l${blocks.length}`;
      blocks.push(
        <ul key={key}>
          {list.map((item, i) => (
            <li key={i}>{renderInline(item, `${key}-${i}`)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.trimStart().startsWith('|')) {
      flushParagraph();
      flushList();
      const rows: string[] = [];
      for (; i < lines.length && lines[i]!.trimStart().startsWith('|'); i++) rows.push(lines[i]!);
      i--;
      blocks.push(renderTable(rows, `t${blocks.length}`));
    } else if (line.trimStart().startsWith('```')) {
      flushParagraph();
      flushList();
      const code: string[] = [];
      for (i++; i < lines.length && !lines[i]!.trimStart().startsWith('```'); i++) {
        code.push(lines[i]!);
      }
      blocks.push(
        <pre key={`c${blocks.length}`}>
          <code>{code.join('\n')}</code>
        </pre>,
      );
    } else if (/^\s*[-*]\s+/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^\s*[-*]\s+/, ''));
    } else if (line.trim() === '') {
      flushParagraph();
      flushList();
    } else {
      flushList();
      // Nagłówki (choć o nie nie prosimy) pokazujemy jak zwykły tekst.
      paragraph.push(line.replace(/^#+\s*/, '').trim());
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

const cells = (row: string) =>
  row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());

/** Tabela `| a | b |`; wiersz `|---|---|` oddziela nagłówek od treści. */
function renderTable(rows: string[], key: string): ReactNode {
  const separator = rows.findIndex((row) => /^\s*\|[\s:|-]+\|?\s*$/.test(row) && row.includes('-'));
  const head = separator > 0 ? rows.slice(0, separator) : [];
  const body = separator > 0 ? rows.slice(separator + 1) : rows;
  return (
    <div key={key} className="rich-table">
      <table>
        {head.length > 0 && (
          <thead>
            {head.map((row, r) => (
              <tr key={r}>
                {cells(row).map((cell, c) => (
                  <th key={c} scope="col">
                    {renderInline(cell, `${key}-h${r}-${c}`)}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        )}
        <tbody>
          {body.map((row, r) => (
            <tr key={r}>
              {cells(row).map((cell, c) => (
                <td key={c}>{renderInline(cell, `${key}-${r}-${c}`)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
