import { cellFromText, sheetFromText, splitRows } from './importData';

describe('cellFromText', () => {
  it('rozpoznaje liczby (także z przecinkiem dziesiętnym)', () => {
    expect(cellFromText('211')).toMatchObject({ v: 211, ct: { t: 'n' } });
    expect(cellFromText('27,8')).toMatchObject({ v: 27.8, ct: { t: 'n' } });
    expect(cellFromText('-0.5')).toMatchObject({ v: -0.5 });
  });

  it('rozpoznaje daty w obu formatach z plików', () => {
    expect(cellFromText('01.05.2020')).toEqual({
      v: 43952,
      m: '2020-05-01',
      ct: { fa: 'yyyy-mm-dd', t: 'd' },
    });
    expect(cellFromText('2020-05-01')).toMatchObject({ v: 43952, ct: { t: 'd' } });
  });

  it('zostawia tekstem napisy, numery z zerem na początku i długie ciągi cyfr', () => {
    expect(cellFromText('164-61-25-530')).toMatchObject({ v: '164-61-25-530', ct: { t: 's' } });
    expect(cellFromText('Mare Boreum')).toMatchObject({ v: 'Mare Boreum' });
    expect(cellFromText('0123')).toMatchObject({ v: '0123', ct: { t: 's' } });
    expect(cellFromText('12345678901234567890')).toMatchObject({ ct: { t: 's' } });
  });
});

describe('splitRows', () => {
  it('pomija BOM, puste linie i obsługuje CRLF', () => {
    expect(splitRows('﻿a\tb\r\n1\t2\r\n\r\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
});

describe('sheetFromText', () => {
  it('wczytuje plik z nagłówkiem (pogrubionym)', () => {
    const sheet = sheetFromText(
      { sheet: 'owoce', path: 'x', hasHeader: true },
      'data\tmaliny\n01.05.2020\t211\n',
      0,
    );
    expect(sheet.name).toBe('owoce');
    expect(sheet.status).toBe(1);
    expect(sheet.celldata).toContainEqual({
      r: 0,
      c: 1,
      v: { v: 'maliny', m: 'maliny', ct: { fa: '@', t: 's' }, bl: 1 },
    });
    expect(sheet.celldata).toContainEqual({ r: 1, c: 1, v: expect.objectContaining({ v: 211 }) });
    expect(sheet.config?.columnlen?.['0']).toBeGreaterThanOrEqual(70);
  });

  it('dopisuje nagłówki, gdy plik ich nie ma', () => {
    const sheet = sheetFromText(
      { sheet: 'cennik', path: 'x', headers: ['odmiana', 'cena'] },
      'Alwa\t2,9\n',
      1,
    );
    expect(sheet.status).toBe(0);
    expect(sheet.celldata?.map((cell) => cell.v?.v)).toEqual(['odmiana', 'cena', 'Alwa', 2.9]);
  });

  it('bez nagłówka pierwszy wiersz to dane', () => {
    const sheet = sheetFromText({ sheet: 's', path: 'x' }, 'Alwa\t2,9\n', 0);
    expect(sheet.celldata?.[0]?.v).not.toHaveProperty('bl');
  });
});
