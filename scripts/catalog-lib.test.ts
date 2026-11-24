import { buildCatalog } from './catalog-lib';

describe('buildCatalog', () => {
  const files = [
    'arkusze/2024/maj/arkusz/a.pdf',
    'arkusze/2024/maj/odpowiedzi/a-odpowiedzi.pdf',
    'arkusze/2024/maj/pliki/Dane/liczby.txt',
    'arkusze/2024/probna-CKE-grudzien/arkusz/p.pdf',
    'arkusze/2023/maj/arkusz/b-2.pdf',
    'arkusze/2023/maj/arkusz/b.pdf',
    'favicon.svg',
  ];

  it('grupuje pliki według sesji i sekcji', () => {
    const catalog = buildCatalog(files);
    const maj2024 = catalog.find((s) => s.id === '2024/maj');
    expect(maj2024).toMatchObject({
      year: 2024,
      kind: 'glowna',
      sheets: ['arkusze/2024/maj/arkusz/a.pdf'],
      answers: ['arkusze/2024/maj/odpowiedzi/a-odpowiedzi.pdf'],
      attachments: ['arkusze/2024/maj/pliki/Dane/liczby.txt'],
    });
  });

  it('pomija pliki spoza struktury arkuszy', () => {
    expect(buildCatalog(['favicon.svg', 'arkusze/README.md'])).toEqual([]);
  });

  it('sortuje sesje od najnowszych, a części arkusza po kolei', () => {
    const catalog = buildCatalog(files);
    expect(catalog.map((s) => s.id)).toEqual(['2024/maj', '2024/probna-CKE-grudzien', '2023/maj']);
    expect(catalog[2]!.sheets).toEqual([
      'arkusze/2023/maj/arkusz/b.pdf',
      'arkusze/2023/maj/arkusz/b-2.pdf',
    ]);
  });
});
