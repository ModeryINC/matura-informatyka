import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useImperativeHandle, type Ref } from 'react';
import type { SpreadsheetHandle } from '../components/SpreadsheetWorkbook';
import { loadAnswers, loadWorkbook, saveWorkbook } from '../lib/spreadsheet/storage';
import { sheetsToXlsx } from '../lib/spreadsheet/xlsx';
import { renderAt } from '../../tests/render';
import { ExcelTaskPage } from './ExcelTaskPage';
import { ExcelTasksPage } from './ExcelTasksPage';

/** Zaznaczenie, które „widzi” sztuczny arkusz. */
let selection: string[][] | null = null;
const changes: { emit?: (sheets: unknown[]) => void } = {};

// Prawdziwy arkusz rysuje na <canvas>, którego jsdom nie ma – podmieniamy go.
vi.mock('../components/SpreadsheetWorkbook', () => ({
  default: function FakeWorkbook({
    sheets,
    onChange,
    ref,
  }: {
    sheets: { name: string }[];
    onChange: (s: unknown[]) => void;
    ref: Ref<SpreadsheetHandle>;
  }) {
    useImperativeHandle(ref, () => ({
      getSelectionValues: () => selection,
      getSheets: () => null,
    }));
    changes.emit = onChange;
    return <div data-testid="arkusz">{sheets.map((s) => s.name).join(',')}</div>;
  },
}));

const routes = [
  { path: '/excel', element: <ExcelTasksPage /> },
  { path: '/excel/:taskId', element: <ExcelTaskPage /> },
];

beforeEach(() => {
  localStorage.clear();
  selection = null;
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    async () => new Response('data\tdostawa_malin\n01.05.2020\t211\n'),
  );
});

afterEach(() => vi.restoreAllMocks());

describe('ExcelTasksPage', () => {
  it('pokazuje zadania z postępem', () => {
    localStorage.setItem(
      'matura-inf:excel:2023-maj-6',
      JSON.stringify({
        parts: {
          '6.1': { passed: true },
          '6.2': { passed: true },
          '6.3': { passed: true },
          '6.4': { passed: true },
        },
      }),
    );
    renderAt('/excel', routes);
    expect(screen.getAllByRole('link', { name: 'Konfitury owocowe' })[0]).toHaveAttribute(
      'href',
      '/excel/2023-maj-6',
    );
    expect(screen.getByText('Wszystko zaliczone')).toBeInTheDocument();
    expect(screen.getAllByText(/Zaliczone: 0\//).length).toBeGreaterThan(30);
    expect(screen.getByRole('heading', { name: '2018' })).toBeInTheDocument();
  });
});

describe('ExcelTaskPage', () => {
  it('wczytuje dane do arkusza i sprawdza odpowiedź wstawioną z zaznaczenia', async () => {
    renderAt('/excel/2023-maj-6', routes);
    expect(await screen.findByTestId('arkusz')).toHaveTextContent('owoce');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('owoce.txt'));

    const part = screen.getByRole('region', { name: 'Zadanie 6.2' });
    const insert = within(part).getByRole('button', { name: /Wstaw z zaznaczenia/ });
    await userEvent.click(insert);
    expect(within(part).getByText(/Najpierw zaznacz/)).toBeInTheDocument();

    selection = [['18']];
    await userEvent.click(insert);
    expect(within(part).getByRole('textbox', { name: 'Liczba dni' })).toHaveValue('18');
    await userEvent.click(within(part).getByRole('button', { name: /Sprawdź/ }));
    expect(within(part).getByText('Niepoprawnych odpowiedzi: 1.')).toBeInTheDocument();

    const input = within(part).getByRole('textbox', { name: 'Liczba dni' });
    await userEvent.clear(input);
    await userEvent.type(input, '19');
    await userEvent.click(within(part).getByRole('button', { name: /Sprawdź/ }));
    expect(within(part).getByText(/Wszystko się zgadza/)).toBeInTheDocument();
    expect(screen.getByText(/Zaliczone: 1\/4 podpunktów · 1\/10 pkt/)).toBeInTheDocument();
    expect(loadAnswers('2023-maj-6').parts['6.2']).toEqual({ fields: ['19'], passed: true });
  });

  it('wstawia zestawienie z podpisami i oznacza błędne komórki', async () => {
    renderAt('/excel/2023-maj-6', routes);
    await screen.findByTestId('arkusz');
    const part = screen.getByRole('region', { name: 'Zadanie 6.3' });
    const insert = within(part).getByRole('button', { name: /Wstaw z zaznaczenia/ });

    selection = [['1', '2']];
    await userEvent.click(insert);
    expect(within(part).getByText(/Zaznacz zakres 3 × 1/)).toBeInTheDocument();

    selection = [
      ['malinowo-porzeczkowe', '41'],
      ['malinowo-truskawkowe', '72'],
      ['truskawkowo-porzeczkowe', '39'],
    ];
    await userEvent.click(insert);
    await userEvent.click(within(part).getByRole('button', { name: /Sprawdź/ }));
    expect(
      within(part).getByRole('textbox', { name: 'truskawkowo-porzeczkowe – liczba dni produkcji' }),
    ).toHaveAttribute('aria-invalid', 'true');
    expect(within(part).getByText('Niepoprawnych odpowiedzi: 1.')).toBeInTheDocument();
  });

  it('wstawia kilka pól naraz i zgłasza złą liczbę komórek', async () => {
    renderAt('/excel/2024-maj-7', routes);
    expect(await screen.findByTestId('arkusz')).toHaveTextContent('jablka,cennik');
    const part = screen.getByRole('region', { name: 'Zadanie 7.2' });
    const insert = within(part).getByRole('button', { name: /Wstaw z zaznaczenia/ });

    selection = [['1', '2', '3']];
    await userEvent.click(insert);
    expect(within(part).getByText(/Zaznacz jedną komórkę/)).toBeInTheDocument();

    selection = [['2 422 669,40 zł'], ['Reneta']];
    await userEvent.click(insert);
    await userEvent.click(within(part).getByRole('button', { name: /Sprawdź/ }));
    expect(within(part).getByText(/Wszystko się zgadza/)).toBeInTheDocument();
  });

  it('zapisuje zmiany arkusza i przywraca dane z plików', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderAt('/excel/2026-maj-7', routes);
    await screen.findByTestId('arkusz');
    changes.emit?.([{ name: 'staw', data: [[{ v: 5 }]] }]);
    vi.advanceTimersByTime(1500);
    expect(loadWorkbook('2026-maj-7')).toEqual([
      { name: 'staw', celldata: [{ r: 0, c: 0, v: { v: 5 } }] },
    ]);
    vi.useRealTimers();

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await userEvent.click(screen.getByRole('button', { name: 'Przywróć dane z plików' }));
    expect(loadWorkbook('2026-maj-7')).toBeNull();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  });

  it('używa zapisanego arkusza bez pobierania plików', async () => {
    saveWorkbook('2025-maj-6', [{ name: 'zapisany', celldata: [] }]);
    renderAt('/excel/2025-maj-6', routes);
    expect(await screen.findByTestId('arkusz')).toHaveTextContent('zapisany');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('ostrzega, gdy arkusz nie mieści się w pamięci', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderAt('/excel/2026-maj-7', routes);
    await screen.findByTestId('arkusz');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    changes.emit?.([{ name: 'staw', celldata: [] }]);
    vi.advanceTimersByTime(1500);
    vi.useRealTimers();
    expect(await screen.findByText(/za duży/)).toBeInTheDocument();
  });

  it('pokazuje błąd pobierania danych i stronę 404 dla nieznanego zadania', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('', { status: 500 }));
    renderAt('/excel/2023-maj-6', routes);
    expect(await screen.findByText('Nie udało się pobrać plików z danymi.')).toBeInTheDocument();
  });

  it('nieznane zadanie → 404', () => {
    renderAt('/excel/brak', routes);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/nie znaleziono|404/i);
  });
});

describe('zadanie bez pliku i podpunkt z samym wykresem', () => {
  it('pokazuje pusty arkusz i podpunkt wykresu bez przycisków sprawdzania', async () => {
    renderAt('/excel/2023-stara-formula-czerwiec-5', routes);
    expect(await screen.findByTestId('arkusz')).toHaveTextContent('Arkusz1');
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByText(/zaczynasz od pustego arkusza/)).toBeInTheDocument();
    const chartOnly = screen.getByRole('region', { name: 'Zadanie 5.2' });
    expect(within(chartOnly).queryByRole('button', { name: /Sprawdź/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Zaliczone: 0\/4 podpunktów/)).toBeInTheDocument();
  });
});

describe('eksport i import .xlsx', () => {
  it('eksportuje arkusz do pliku .xlsx', async () => {
    const createUrl = vi.fn<(blob: Blob) => string>(() => 'blob:arkusz');
    Object.assign(URL, { createObjectURL: createUrl, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    renderAt('/excel/2023-maj-6', routes);
    await screen.findByTestId('arkusz');
    await userEvent.click(screen.getByRole('button', { name: /Eksportuj do \.xlsx/ }));
    await waitFor(() => expect(click).toHaveBeenCalled());
    expect(createUrl.mock.calls[0]![0]).toBeInstanceOf(Blob);
    expect((click.mock.contexts[0] as HTMLAnchorElement).download).toBe('2023-maj-6.xlsx');
  });

  it('wczytuje arkusz z pliku .xlsx po potwierdzeniu', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const blob = await sheetsToXlsx([
      {
        name: 'z pliku',
        order: 0,
        celldata: [{ r: 0, c: 0, v: { v: 5, m: '5', ct: { fa: 'General', t: 'n' } } }],
      },
    ]);
    const file = new File([await blob.arrayBuffer()], 'moje.xlsx');
    const { container } = renderAt('/excel/2023-maj-6', routes);
    await screen.findByTestId('arkusz');
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(input, file);
    expect(await screen.findByText('Wczytano plik „moje.xlsx”.')).toBeInTheDocument();
    expect(screen.getByTestId('arkusz')).toHaveTextContent('z pliku');
    expect(loadWorkbook('2023-maj-6')?.[0]?.name).toBe('z pliku');
  });

  it('pokazuje błąd dla pliku, który nie jest skoroszytem', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { container } = renderAt('/excel/2023-maj-6', routes);
    await screen.findByTestId('arkusz');
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(input, new File(['nie xlsx'], 'zly.xlsx'));
    expect(await screen.findByText(/Nie udało się wczytać pliku/)).toBeInTheDocument();
    expect(screen.getByTestId('arkusz')).toHaveTextContent('owoce');
  });
});
