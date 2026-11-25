import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { tasks } from '../data';
import { loadSolution } from '../lib/storage';
import type { PythonRunner } from '../python/runner';
import type { SubmissionResult } from '../types';
import { renderAt } from '../../tests/render';
import { TaskPage } from './TaskPage';

/** Atrapa interpretera – testy UI nie uruchamiają prawdziwego Pythona. */
function fakeRunner(result: SubmissionResult) {
  const runner = {
    status: 'ready',
    onStatus: () => () => {},
    execute: vi.fn().mockResolvedValue({ stdout: 'Witaj\n', error: null }),
    submit: vi.fn().mockResolvedValue(result),
  };
  return runner as unknown as PythonRunner & typeof runner;
}

const task = tasks.find((t) => t.id === '2024-maj-3.2')!;

const renderTask = (runner: PythonRunner, id = task.id) =>
  renderAt(`/zadanie/${id}`, [{ path: '/zadanie/:taskId', element: <TaskPage runner={runner} /> }]);

describe('TaskPage', () => {
  it('pokazuje treść zadania, tematy i kod startowy', () => {
    renderTask(fakeRunner({ passed: true, results: [], durationMs: 1 }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(task.title);
    expect(screen.getByText(/Teoria liczb/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sprawdź/ })).toBeEnabled();
    expect(screen.getByRole('link', { name: /Zadanie 3.3/ })).toBeInTheDocument();
  });

  it('po sprawdzeniu pokazuje wynik i zapisuje rozwiązanie', async () => {
    const result: SubmissionResult = {
      passed: true,
      durationMs: 12,
      results: [{ label: 'Dane przykładowe', passed: true, expected: '2', actual: '2' }],
    };
    const runner = fakeRunner(result);
    renderTask(runner);
    await userEvent.click(screen.getByRole('button', { name: /Sprawdź/ }));
    expect(await screen.findByText(/Zaliczone!/)).toBeInTheDocument();
    expect(runner.submit).toHaveBeenCalledWith(task, task.starterCode);
    expect(loadSolution(task.id)).toMatchObject({ passed: true, everPassed: true });
  });

  it('pokazuje niezaliczone testy z oczekiwanym i otrzymanym wynikiem', async () => {
    renderTask(
      fakeRunner({
        passed: false,
        durationMs: 3,
        results: [
          {
            label: 'Dane egzaminacyjne',
            passed: false,
            expected: '18',
            actual: '17',
            error: 'NameError',
          },
        ],
      }),
    );
    await userEvent.click(screen.getByRole('button', { name: /Sprawdź/ }));
    expect(await screen.findByText(/Jeszcze nie/)).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();
    expect(screen.getByText('NameError')).toBeInTheDocument();
  });

  it('przycisk Uruchom pokazuje wyjście w konsoli i przekazuje dane wejściowe', async () => {
    const runner = fakeRunner({ passed: true, results: [], durationMs: 1 });
    renderTask(runner);
    await userEvent.type(screen.getByLabelText('Wejście (stdin)'), '5{enter}7');
    await userEvent.click(screen.getByRole('button', { name: /Uruchom/ }));
    expect(await screen.findByRole('log')).toHaveTextContent('Witaj');
    expect(runner.execute).toHaveBeenCalledWith(
      task,
      task.starterCode,
      expect.objectContaining({ stdin: '5\n7' }),
    );

    await userEvent.click(screen.getByRole('button', { name: 'Wyczyść' }));
    expect(screen.getByRole('log')).not.toHaveTextContent('Witaj');
  });

  it('pokazuje wyjście na bieżąco i błąd programu', async () => {
    const runner = fakeRunner({ passed: true, results: [], durationMs: 1 });
    let finish: (value: { stdout: string; error: string | null }) => void = () => {};
    runner.execute.mockImplementation(
      (_task: unknown, _code: unknown, options: { onOutput: (text: string) => void }) => {
        options.onOutput('Podaj n: 3\n');
        return new Promise((resolve) => (finish = resolve));
      },
    );
    renderTask(runner);
    await userEvent.click(screen.getByRole('button', { name: /Uruchom/ }));
    expect(await screen.findByText('działa…')).toBeInTheDocument();
    expect(screen.getByRole('log')).toHaveTextContent('Podaj n: 3');

    finish({ stdout: 'Podaj n: 3\n', error: 'ZeroDivisionError' });
    expect(await screen.findByText('ZeroDivisionError')).toBeInTheDocument();
    expect(screen.queryByText('działa…')).not.toBeInTheDocument();
  });

  it('dla nieznanego zadania pokazuje stronę 404', () => {
    renderTask(fakeRunner({ passed: true, results: [], durationMs: 1 }), 'nie-ma');
    expect(screen.getByRole('heading', { name: 'Nie znaleziono strony' })).toBeInTheDocument();
  });
});
