import { useId, useState } from 'react';
import {
  bitmapBytes,
  caesar,
  divisionSteps,
  fromU2,
  GATES,
  ipv4Binary,
  maskFromPrefix,
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
  type GateName,
} from '../lib/theory/tools';

export type TheoryToolId =
  'liczby' | 'u2' | 'podsieci' | 'kolory' | 'obraz' | 'bramki' | 'cezar' | 'rsa';

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n: number) => [...String(n)].map((d) => SUB[Number(d)]).join('');
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (n: number) => [...String(n)].map((d) => SUP[Number(d)]).join('');

function Tool({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="theory-tool" aria-label={`Narzędzie: ${title}`}>
      <h3 className="theory-tool__title">{title}</h3>
      {children}
    </section>
  );
}

function NumberTool() {
  const id = useId();
  const [text, setText] = useState('186');
  const [base, setBase] = useState(10);
  const value = parseInBase(text, base);
  return (
    <Tool title="Zamiana systemów liczbowych">
      <div className="theory-tool__row">
        <label htmlFor={`${id}-v`}>Liczba</label>
        <input
          id={`${id}-v`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
        <label htmlFor={`${id}-b`}>w systemie</label>
        <select id={`${id}-b`} value={base} onChange={(e) => setBase(Number(e.target.value))}>
          {[2, 3, 4, 5, 8, 10, 16].map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
      {value === null ? (
        <p className="hints__error" role="alert">
          To nie jest poprawna liczba naturalna w systemie o podstawie {base}.
        </p>
      ) : (
        <>
          <table className="theory-tool__table">
            <tbody>
              {[2, 4, 8, 10, 16].map((b) => (
                <tr key={b}>
                  <th scope="row">system {b}</th>
                  <td>
                    <code>
                      {toBase(value, b)}
                      {sub(b)}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {base !== 10 && (
            <p className="theory-tool__steps">
              Na dziesiętny: {text.toUpperCase().trim()}
              {sub(base)} ={' '}
              {positionalTerms(text.replace(/\s+/g, ''))
                .map(({ digit, power }) => `${digit}·${base}${sup(power)}`)
                .join(' + ')}{' '}
              = {value}
            </p>
          )}
          {base === 10 && value <= 1_000_000 && (
            <p className="theory-tool__steps">
              Na dwójkowy (dzielenie przez 2, reszty czytamy od dołu):{' '}
              {divisionSteps(value, 2)
                .map(
                  (s, i, all) =>
                    `${i === 0 ? value : all[i - 1]!.quotient} : 2 = ${s.quotient} r ${s.remainder}`,
                )
                .join(' → ')}
            </p>
          )}
        </>
      )}
    </Tool>
  );
}

function U2Tool() {
  const id = useId();
  const [value, setValue] = useState(-5);
  const [bits, setBits] = useState(8);
  const code = toU2(value, bits);
  return (
    <Tool title="Kod uzupełnień do dwóch (U2)">
      <div className="theory-tool__row">
        <label htmlFor={`${id}-v`}>Liczba całkowita</label>
        <input
          id={`${id}-v`}
          type="number"
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => setValue(Number(e.target.value))}
        />
        <label htmlFor={`${id}-b`}>bitów</label>
        <select id={`${id}-b`} value={bits} onChange={(e) => setBits(Number(e.target.value))}>
          {[4, 8, 16].map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </div>
      {code === null ? (
        <p className="hints__error" role="alert">
          Na {bits} bitach w U2 zapiszemy liczby od {-(2 ** (bits - 1))} do {2 ** (bits - 1) - 1}.
        </p>
      ) : (
        <p className="theory-tool__result">
          <code className="theory-bits">
            {[...code].map((bit, i) => (
              <span key={i} className={i === 0 ? 'theory-bits__sign' : undefined}>
                {bit}
              </span>
            ))}
          </code>{' '}
          = −{code[0]}·2{sup(bits - 1)} + {parseInt(code.slice(1), 2)} ={' '}
          <strong>{fromU2(code)}</strong>
        </p>
      )}
      <p className="muted">
        Pierwszy bit ma wagę ujemną (−2{sup(bits - 1)}). Liczbę przeciwną otrzymasz, negując
        wszystkie bity i dodając 1.
      </p>
    </Tool>
  );
}

function SubnetTool() {
  const id = useId();
  const [address, setAddress] = useState('192.168.10.65');
  const [mask, setMask] = useState('255.255.255.192');
  const ip = parseIPv4(address);
  const prefix = /^\/?\d{1,2}$/.test(mask.trim())
    ? Math.min(32, Number(mask.replace('/', '')))
    : prefixFromMask(mask);
  const info = ip !== null && prefix !== null ? subnet(ip, prefix) : null;
  return (
    <Tool title="Kalkulator adresacji IPv4">
      <div className="theory-tool__row">
        <label htmlFor={`${id}-a`}>Adres IP</label>
        <input id={`${id}-a`} value={address} onChange={(e) => setAddress(e.target.value)} />
        <label htmlFor={`${id}-m`}>Maska (lub /prefiks)</label>
        <input id={`${id}-m`} value={mask} onChange={(e) => setMask(e.target.value)} />
      </div>
      {info === null ? (
        <p className="hints__error" role="alert">
          Podaj adres w postaci a.b.c.d (0–255) i poprawną maskę, np. 255.255.255.0 albo /24.
        </p>
      ) : (
        <table className="theory-tool__table">
          <tbody>
            <tr>
              <th scope="row">adres (binarnie)</th>
              <td>
                <code>{ipv4Binary(ip!)}</code>
              </td>
            </tr>
            <tr>
              <th scope="row">maska /{info.prefix}</th>
              <td>
                <code>{info.mask}</code> = <code>{ipv4Binary(maskFromPrefix(info.prefix))}</code>
              </td>
            </tr>
            <tr>
              <th scope="row">adres sieci</th>
              <td>
                <code>{info.network}</code> (adres AND maska)
              </td>
            </tr>
            <tr>
              <th scope="row">adres rozgłoszeniowy</th>
              <td>
                <code>{info.broadcast}</code> (same jedynki w części hosta)
              </td>
            </tr>
            <tr>
              <th scope="row">hosty</th>
              <td>
                {info.firstHost ? (
                  <>
                    <code>{info.firstHost}</code> – <code>{info.lastHost}</code> ({info.hosts} = 2
                    {sup(32 - info.prefix)} − 2)
                  </>
                ) : (
                  'brak (sieć /31 lub /32)'
                )}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </Tool>
  );
}

function ColorTool() {
  const id = useId();
  const [hex, setHex] = useState('#E9967A');
  const rgb = parseHexColor(hex);
  return (
    <Tool title="Kolory: zapis szesnastkowy i RGB">
      <div className="theory-tool__row">
        <label htmlFor={`${id}-h`}>Kolor #RRGGBB</label>
        <input id={`${id}-h`} value={hex} onChange={(e) => setHex(e.target.value)} />
        <input
          type="color"
          aria-label="Wybierz kolor"
          value={rgb ? toHexColor(rgb).toLowerCase() : '#000000'}
          onChange={(e) => setHex(e.target.value.toUpperCase())}
        />
      </div>
      {rgb ? (
        <p className="theory-tool__result">
          <span className="theory-swatch" style={{ background: toHexColor(rgb) }} aria-hidden />
          <code>
            rgb({rgb[0]}, {rgb[1]}, {rgb[2]})
          </code>{' '}
          – czerwony {toHexColor(rgb).slice(1, 3)}
          {sub(16)} = {rgb[0]}, zielony {toHexColor(rgb).slice(3, 5)}
          {sub(16)} = {rgb[1]}, niebieski {toHexColor(rgb).slice(5, 7)}
          {sub(16)} = {rgb[2]}
        </p>
      ) : (
        <p className="hints__error" role="alert">
          Podaj kolor w postaci #RRGGBB, np. #FF8800.
        </p>
      )}
    </Tool>
  );
}

const DEPTHS: [number, string][] = [
  [1, '2 kolory (czarno-biały)'],
  [4, '16 kolorów'],
  [8, '256 kolorów'],
  [16, '65 536 kolorów'],
  [24, 'ok. 16,7 mln kolorów'],
  [32, '16,7 mln kolorów + przezroczystość'],
];

function ImageTool() {
  const id = useId();
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [bpp, setBpp] = useState(24);
  const bytes = bitmapBytes(width || 0, height || 0, bpp);
  return (
    <Tool title="Rozmiar obrazu bez kompresji">
      <div className="theory-tool__row">
        <label htmlFor={`${id}-w`}>Szerokość (px)</label>
        <input
          id={`${id}-w`}
          type="number"
          min={1}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
        />
        <label htmlFor={`${id}-h`}>Wysokość (px)</label>
        <input
          id={`${id}-h`}
          type="number"
          min={1}
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
        />
        <label htmlFor={`${id}-b`}>Głębia</label>
        <select id={`${id}-b`} value={bpp} onChange={(e) => setBpp(Number(e.target.value))}>
          {DEPTHS.map(([b, label]) => (
            <option key={b} value={b}>
              {b} bit – {label}
            </option>
          ))}
        </select>
      </div>
      <p className="theory-tool__result">
        {width} · {height} · {bpp} bit = {(width * height * bpp).toLocaleString('pl-PL')} bitów ={' '}
        <strong>{bytes.toLocaleString('pl-PL')} B</strong> ≈{' '}
        {(bytes / 1024).toLocaleString('pl-PL', { maximumFractionDigits: 1 })} KiB ≈{' '}
        {(bytes / 1024 ** 2).toLocaleString('pl-PL', { maximumFractionDigits: 2 })} MiB
      </p>
    </Tool>
  );
}

function GatesTool() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <Tool title="Bramki logiczne">
      <div className="theory-tool__row">
        {(
          [
            ['a', a, setA],
            ['b', b, setB],
          ] as const
        ).map(([name, value, set]) => (
          <button
            key={name}
            type="button"
            className={`theory-bit${value ? ' is-on' : ''}`}
            aria-pressed={value}
            onClick={() => set(!value)}
          >
            {name} = {value ? 1 : 0}
          </button>
        ))}
        <span className="muted">kliknij, żeby zmienić wejście</span>
      </div>
      <table className="theory-tool__table theory-gates">
        <thead>
          <tr>
            <th scope="col">NOT a</th>
            {(Object.keys(GATES) as GateName[]).map((gate) => (
              <th key={gate} scope="col">
                a {gate} b
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={!a ? 'is-on' : undefined}>{a ? 0 : 1}</td>
            {(Object.keys(GATES) as GateName[]).map((gate) => {
              const out = GATES[gate](a, b);
              return (
                <td key={gate} className={out ? 'is-on' : undefined}>
                  {out ? 1 : 0}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </Tool>
  );
}

function CaesarTool() {
  const id = useId();
  const [text, setText] = useState('MATURA Z INFORMATYKI');
  const [shift, setShift] = useState(3);
  return (
    <Tool title="Szyfr Cezara">
      <div className="theory-tool__row">
        <label htmlFor={`${id}-t`}>Tekst</label>
        <input id={`${id}-t`} value={text} onChange={(e) => setText(e.target.value)} />
        <label htmlFor={`${id}-k`}>Klucz (przesunięcie)</label>
        <input
          id={`${id}-k`}
          type="number"
          value={shift}
          onChange={(e) => setShift(Number(e.target.value) || 0)}
        />
      </div>
      <p className="theory-tool__result">
        Szyfrogram: <code>{caesar(text, shift)}</code>
      </p>
      <p className="muted">
        Odszyfrowanie to przesunięcie o −{shift} (albo o {(((26 - shift) % 26) + 26) % 26}). Klucz
        jest jeden i ten sam do obu operacji – to szyfr symetryczny.
      </p>
    </Tool>
  );
}

function RsaTool() {
  const id = useId();
  const [p, setP] = useState(11);
  const [q, setQ] = useState(13);
  const [message, setMessage] = useState(42);
  const keys = rsaKeys(p, q);
  const valid = keys !== null && Number.isInteger(message) && message >= 0 && message < keys.n;
  const cipher = valid ? modPow(message, keys.e, keys.n) : null;
  return (
    <Tool title="RSA na małych liczbach">
      <div className="theory-tool__row">
        <label htmlFor={`${id}-p`}>p</label>
        <input
          id={`${id}-p`}
          type="number"
          value={p}
          onChange={(e) => setP(Number(e.target.value))}
        />
        <label htmlFor={`${id}-q`}>q</label>
        <input
          id={`${id}-q`}
          type="number"
          value={q}
          onChange={(e) => setQ(Number(e.target.value))}
        />
        <label htmlFor={`${id}-m`}>wiadomość m</label>
        <input
          id={`${id}-m`}
          type="number"
          value={message}
          onChange={(e) => setMessage(Number(e.target.value))}
        />
      </div>
      {keys === null ? (
        <p className="hints__error" role="alert">
          p i q muszą być różnymi liczbami pierwszymi (iloczyn do 10 000).
        </p>
      ) : (
        <ol className="theory-tool__list">
          <li>
            n = p · q = {p} · {q} = {keys.n}, φ = (p − 1)(q − 1) = {keys.phi}
          </li>
          <li>
            e = {keys.e} (względnie pierwsze z φ), d = {keys.d} (bo e · d mod φ = 1)
          </li>
          <li>
            klucz publiczny:{' '}
            <strong>
              (e, n) = ({keys.e}, {keys.n})
            </strong>
            , klucz prywatny:{' '}
            <strong>
              (d, n) = ({keys.d}, {keys.n})
            </strong>
          </li>
          {valid ? (
            <li>
              szyfrowanie kluczem publicznym: c = m{sup(keys.e)} mod n = {cipher}; odszyfrowanie
              kluczem prywatnym: c<sup>d</sup> mod n = {modPow(cipher!, keys.d, keys.n)}
            </li>
          ) : (
            <li className="hints__error">wiadomość m musi być liczbą od 0 do {keys.n - 1}</li>
          )}
        </ol>
      )}
    </Tool>
  );
}

const TOOLS: Record<TheoryToolId, () => React.ReactNode> = {
  liczby: NumberTool,
  u2: U2Tool,
  podsieci: SubnetTool,
  kolory: ColorTool,
  obraz: ImageTool,
  bramki: GatesTool,
  cezar: CaesarTool,
  rsa: RsaTool,
};

export function TheoryTool({ id }: { id: TheoryToolId }) {
  const Component = TOOLS[id];
  return <Component />;
}
