import type { Sheet } from '@fortune-sheet/core';
import ExcelJS from 'exceljs';
import { cellFromText } from './importData';
import { fromFileFormula, sheetsToXlsx, toFileFormula, xlsxToSheets } from './xlsx';

const cellAt = (sheet: Sheet, r: number, c: number) =>
  sheet.celldata?.find((cell) => cell.r === r && cell.c === c)?.v;

describe('formuły w pliku', () => {
  it('dodaje i usuwa przedrostki nowych funkcji', () => {
    expect(toFileFormula('=SUM(A1:A3)')).toBe('SUM(A1:A3)');
    expect(toFileFormula('=UNIQUE(A:A)')).toBe('_xlfn.UNIQUE(A:A)');
    expect(toFileFormula('=SORT(FILTER(A:A,B:B>1))')).toBe(
      '_xlfn._xlws.SORT(_xlfn._xlws.FILTER(A:A,B:B>1))',
    );
    expect(toFileFormula('=IF(A1="UNIQUE(x)",1,0)')).toBe('IF(A1="UNIQUE(x)",1,0)');
    expect(fromFileFormula('_xlfn._xlws.SORT(_xlfn.UNIQUE(A:A))')).toBe('=SORT(UNIQUE(A:A))');
  });
});

describe('eksport i import .xlsx', () => {
  const sheets: Sheet[] = [
    {
      name: 'owoce',
      order: 0,
      status: 1,
      config: { columnlen: { '0': 96 } },
      celldata: [
        { r: 0, c: 0, v: { v: 'data', m: 'data', ct: { fa: '@', t: 's' }, bl: 1 } },
        { r: 0, c: 1, v: { v: 'maliny', m: 'maliny', ct: { fa: '@', t: 's' }, bl: 1 } },
        { r: 1, c: 0, v: cellFromText('01.05.2020') },
        { r: 1, c: 1, v: cellFromText('27,5') },
        { r: 2, c: 0, v: cellFromText('07:42:56') },
        { r: 2, c: 1, v: { f: '=SUM(B2:B2)*2', v: 55, m: '55', ct: { fa: 'General', t: 'n' } } },
        {
          r: 3,
          c: 1,
          v: { f: '=B2/0', v: '#DIV/0!', m: '#DIV/0!', ct: { fa: 'General', t: 'n' } },
        },
      ],
    },
    { name: 'wyniki: [maj]', order: 1, status: 0, celldata: [] },
  ];

  it('zachowuje wartości, formuły, daty, pogrubienie i szerokości kolumn', async () => {
    const blob = await sheetsToXlsx(sheets);
    const [imported, second] = await xlsxToSheets(await blob.arrayBuffer());

    expect(imported!.name).toBe('owoce');
    expect(second!.name).toBe('wyniki_ _maj_');
    expect(cellAt(imported!, 0, 0)).toMatchObject({ v: 'data', bl: 1 });
    expect(cellAt(imported!, 1, 0)).toMatchObject({ v: 43952, m: '2020-05-01', ct: { t: 'd' } });
    expect(cellAt(imported!, 1, 1)).toMatchObject({ v: 27.5 });
    expect(cellAt(imported!, 2, 0)).toMatchObject({ m: '07:42:56', ct: { t: 'd' } });
    expect(cellAt(imported!, 2, 1)).toMatchObject({ f: '=SUM(B2:B2)*2', v: 55 });
    expect(cellAt(imported!, 3, 1)).toMatchObject({ f: '=B2/0', v: '#DIV/0!' });
    expect(imported!.calcChain).toEqual([
      { r: 2, c: 1, id: imported!.id },
      { r: 3, c: 1, id: imported!.id },
    ]);
    expect(imported!.config?.columnlen?.['0']).toBeCloseTo(96, -1);
  });

  it('wczytuje formuły współdzielone i daty zapisane przez Excela', async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Arkusz1');
    sheet.getCell('A1').value = new Date(Date.UTC(2020, 4, 1));
    sheet.getCell('A1').numFmt = 'dd.mm.yyyy';
    sheet.getCell('B1').value = 2;
    sheet.getCell('B2').value = 3;
    sheet.getCell('C1').value = { formula: 'B1*10', result: 20 } as ExcelJS.CellFormulaValue;
    sheet.getCell('C2').value = {
      sharedFormula: 'C1',
      result: 30,
    } as ExcelJS.CellSharedFormulaValue;
    sheet.getCell('D1').value = 0.25;
    sheet.getCell('D1').numFmt = '0.00%';
    const buffer = await workbook.xlsx.writeBuffer();

    const [imported] = await xlsxToSheets(buffer as ArrayBuffer);
    expect(cellAt(imported!, 0, 0)).toMatchObject({ v: 43952, m: '2020-05-01' });
    expect(cellAt(imported!, 0, 2)).toMatchObject({ f: '=B1*10', v: 20 });
    expect(cellAt(imported!, 1, 2)).toMatchObject({ f: '=B2*10', v: 30 });
    expect(cellAt(imported!, 0, 3)).toMatchObject({ v: 0.25, m: '25.00%', ct: { fa: '0.00%' } });
  });

  it('odrzuca plik, który nie jest skoroszytem', async () => {
    await expect(xlsxToSheets(new TextEncoder().encode('nie xlsx').buffer)).rejects.toThrow();
  });
});
