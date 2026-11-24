import { useEffect, useRef } from 'react';
import { basicSetup, EditorView } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { indentUnit } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Skrót Ctrl/Cmd+Enter. */
  onSubmit?: () => void;
  label: string;
}

const theme = EditorView.theme({
  '&': { backgroundColor: 'var(--code-bg)', color: 'var(--code-fg)', height: '100%' },
  '.cm-content': { caretColor: 'var(--accent)', fontFamily: 'var(--font-mono)' },
  '.cm-gutters': {
    backgroundColor: 'var(--code-gutter)',
    color: 'var(--text-muted)',
    borderRight: '1px solid var(--border)',
  },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'var(--code-active)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--code-selection) !important',
  },
  '.cm-cursor': { borderLeftColor: 'var(--accent)' },
});

/**
 * Edytor kodu Python oparty na CodeMirror 6.
 * Komponent jest „półkontrolowany”: zewnętrzna zmiana `value` (np. reset)
 * podmienia treść, a wpisywanie zgłasza zmiany przez `onChange`.
 */
export function CodeEditor({ value, onChange, onSubmit, label }: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const callbacks = useRef({ onChange, onSubmit });

  useEffect(() => {
    callbacks.current = { onChange, onSubmit };
  });

  useEffect(() => {
    if (!host.current) return;
    const editor = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          keymap.of([
            {
              key: 'Mod-Enter',
              run: () => {
                callbacks.current.onSubmit?.();
                return true;
              },
            },
            indentWithTab,
          ]),
          basicSetup,
          python(),
          indentUnit.of('    '),
          theme,
          EditorView.contentAttributes.of({ 'aria-label': label }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) callbacks.current.onChange(update.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = editor;
    return () => {
      editor.destroy();
      view.current = null;
    };
    // Edytor tworzymy raz; późniejsze zmiany `value` obsługuje efekt poniżej.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label]);

  useEffect(() => {
    const editor = view.current;
    if (editor && editor.state.doc.toString() !== value) {
      editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } });
    }
  }, [value]);

  return <div className="code-editor" ref={host} />;
}
