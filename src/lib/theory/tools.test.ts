import {
  bitmapBytes,
  bitsForSymbols,
  caesar,
  divisionSteps,
  formatIPv4,
  fromU2,
  ipv4Binary,
  modInverse,
  modPow,
  parseHexColor,
  parseInBase,
  parseIPv4,
  positionalTerms,
  prefixFromMask,
  rsaKeys,
  subnet,
  toBase,
  toHexColor,
  toU2,
} from './tools';

describe('systemy liczbowe', () => {
  it('czyta i zapisuje liczby w różnych systemach', () => {
    expect(parseInBase('BA', 16)).toBe(186);
    expect(parseInBase('ba', 16)).toBe(186);
    expect(parseInBase('1111 1111', 2)).toBe(255);
    expect(parseInBase('19', 8)).toBeNull();
    expect(parseInBase('', 10)).toBeNull();
    expect(toBase(186, 2)).toBe('10111010');
    expect(toBase(186, 4)).toBe('2322');
    expect(toBase(186, 16)).toBe('BA');
  });

  it('pokazuje kroki dzielenia i rozwinięcie pozycyjne', () => {
    expect(divisionSteps(13, 2).map((s) => s.remainder)).toEqual([1, 0, 1, 1]);
    expect(divisionSteps(0, 2)).toEqual([{ quotient: 0, remainder: 0 }]);
    expect(positionalTerms('1A')).toEqual([
      { digit: 1, power: 1 },
      { digit: 10, power: 0 },
    ]);
  });

  it('koduje liczby w U2', () => {
    expect(toU2(5, 8)).toBe('00000101');
    expect(toU2(-1, 8)).toBe('11111111');
    expect(toU2(-128, 8)).toBe('10000000');
    expect(toU2(128, 8)).toBeNull();
    expect(fromU2('11111011')).toBe(-5);
    expect(fromU2('0111')).toBe(7);
    expect(fromU2('12')).toBeNull();
  });
});

describe('adresacja IPv4', () => {
  it('liczy sieć, adres rozgłoszeniowy i liczbę hostów', () => {
    const address = parseIPv4('192.168.10.65')!;
    expect(formatIPv4(address)).toBe('192.168.10.65');
    expect(ipv4Binary(parseIPv4('255.255.255.0')!)).toBe('11111111.11111111.11111111.00000000');
    expect(subnet(address, 24)).toEqual({
      prefix: 24,
      mask: '255.255.255.0',
      network: '192.168.10.0',
      broadcast: '192.168.10.255',
      firstHost: '192.168.10.1',
      lastHost: '192.168.10.254',
      hosts: 254,
    });
    expect(subnet(address, 26).network).toBe('192.168.10.64');
    expect(subnet(address, 26).broadcast).toBe('192.168.10.127');
    expect(subnet(parseIPv4('196.122.128.0')!, 16).network).toBe('196.122.0.0');
    expect(subnet(address, 32).hosts).toBe(0);
  });

  it('rozpoznaje maski', () => {
    expect(prefixFromMask('255.255.255.0')).toBe(24);
    expect(prefixFromMask('255.255.255.192')).toBe(26);
    expect(prefixFromMask('255.255.255.255')).toBe(32);
    expect(prefixFromMask('255.0.255.0')).toBeNull();
    expect(parseIPv4('256.1.1.1')).toBeNull();
  });
});

describe('kolory, szyfry, bramki i obrazy', () => {
  it('zamienia kolory', () => {
    expect(parseHexColor('#E9967A')).toEqual([233, 150, 122]);
    expect(parseHexColor('fff')).toEqual([255, 255, 255]);
    expect(parseHexColor('#12')).toBeNull();
    expect(toHexColor([233, 150, 122])).toBe('#E9967A');
  });

  it('szyfruje Cezarem i odwraca szyfr', () => {
    expect(caesar('Matura 2026!', 3)).toBe('Pdwxud 2026!');
    expect(caesar(caesar('xyz', 5), -5)).toBe('xyz');
  });

  it('liczy klucze RSA i szyfruje', () => {
    const keys = rsaKeys(11, 13)!;
    expect(keys).toEqual({ n: 143, phi: 120, e: 7, d: 103 });
    const c = modPow(42, keys.e, keys.n);
    expect(modPow(c, keys.d, keys.n)).toBe(42);
    expect(rsaKeys(4, 13)).toBeNull();
    expect(modInverse(4, 8)).toBeNull();
  });

  it('liczy rozmiar bitmapy i bity na symbol', () => {
    expect(bitmapBytes(800, 600, 24)).toBe(1_440_000);
    expect(bitsForSymbols(5)).toBe(3);
    expect(bitsForSymbols(256)).toBe(8);
    expect(bitsForSymbols(1)).toBe(0);
  });
});
