import { decodeText, detectSeparator, parseTable } from './tables';

describe('parseTable', () => {
  it('rozpoznaje typy pól i zamienia daty na rrrr-mm-dd', () => {
    const table = parseTable(
      { name: 't', path: 'p' },
      '﻿id\tdata\tkwota\tkod\tgodzina\tkiedy\topis\r\n' +
        '1\t01.05.2020\t2,5\t007\t7:05\t2019-05-22 16:00\tala\r\n' +
        '2\t2020-06-30\t3\t010\t12:30:15\t22.05.2019 08:15:30\t\r\n',
    );
    expect(table.columns).toEqual(['id', 'data', 'kwota', 'kod', 'godzina', 'kiedy', 'opis']);
    expect(table.types).toEqual(['INTEGER', 'DATE', 'REAL', 'TEXT', 'TIME', 'DATETIME', 'TEXT']);
    expect(table.rows).toEqual([
      [1, '2020-05-01', 2.5, '007', '07:05:00', '2019-05-22 16:00:00', 'ala'],
      [2, '2020-06-30', 3, '010', '12:30:15', '2019-05-22 08:15:30', null],
    ]);
    expect(table.irregularRows).toBe(0);
  });

  it('wykrywa separator, przyjmuje nazwy pól z opisu i pomija pusty nagłówek na końcu', () => {
    expect(detectSeparator('a;b')).toBe(';');
    expect(detectSeparator('a b')).toBe(' ');
    expect(parseTable({ name: 't', path: 'p' }, 'a;b;\n1;x;\n').columns).toEqual(['a', 'b']);
    const spaced = parseTable({ name: 't', path: 'p', headers: ['x', 'y'] }, '1  2\n3 4\n');
    expect(spaced.rows).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('zlicza wiersze z nadmiarowymi polami (zły separator)', () => {
    const table = parseTable({ name: 't', path: 'p' }, 'a\tb\n1\t2\t3\n4\t5\t\n6\n');
    expect(table.irregularRows).toBe(1);
    expect(table.rows.at(-1)).toEqual([6, null]);
  });
});

describe('decodeText', () => {
  it('odczytuje UTF-8, UTF-16 z BOM i Windows-1250', () => {
    expect(decodeText(new TextEncoder().encode('Łódź'))).toBe('Łódź');
    expect(decodeText(new Uint8Array([0xff, 0xfe, 0x41, 0x00, 0x42, 0x01]))).toBe('Ał');
    expect(decodeText(new Uint8Array([0xfe, 0xff, 0x00, 0x41]))).toBe('A');
    expect(decodeText(new Uint8Array([0xa3, 0xf3, 0x64, 0x9f]))).toBe('Łódź');
  });
});
