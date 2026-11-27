import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { InlineText } from './HintText';
import { SidePanel } from './SidePanel';

/** Od tej szerokości spis treści stoi obok treści; węższy ekran – wysuwa się z prawej. */
const TOC_DOCKED_QUERY = '(min-width: 1000px)';

const TABS = [
  { to: '/podstawy/python', label: 'Python' },
  { to: '/podstawy/excel', label: 'Excel' },
  { to: '/podstawy/sql', label: 'SQL' },
  { to: '/podstawy/algorytmy', label: 'Algorytmy' },
  { to: '/podstawy/teoria', label: 'Teoria' },
] as const;

export interface BasicsSectionShell {
  id: string;
  title: string;
  intro: string[];
  tips?: string[];
}

interface BasicsLayoutProps<S extends BasicsSectionShell> {
  title: string;
  lead: ReactNode;
  sections: S[];
  /** Przykłady sekcji (między wprowadzeniem a wskazówkami). */
  renderExamples: (section: S) => ReactNode;
  /** Dodatkowa treść nad działami (np. opis przykładowej bazy). */
  before?: ReactNode;
}

/**
 * Trasa nadrzędna „Podstawy”: zakładki zostają na miejscu przy zmianie podstrony
 * (jak w „Zadaniach”), więc kapsułka aktywnej zakładki przesuwa się płynnie.
 */
export function BasicsSection() {
  return (
    <div className="page page--basics">
      <nav aria-label="Podstawy" className="tabs basics-tabs">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className="tabs__tab">
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}

/** Wspólny układ podstron „Podstawy …”: nagłówek, spis treści i działy. */
export function BasicsLayout<S extends BasicsSectionShell>({
  title,
  lead,
  sections,
  renderExamples,
  before,
}: BasicsLayoutProps<S>) {
  const docked = useMediaQuery(TOC_DOCKED_QUERY);
  return (
    <>
      <header className="basics-header">
        <h1>{title}</h1>
        {lead}
      </header>

      <div className="basics">
        {docked ? (
          <nav className="basics__toc" aria-label="Spis treści">
            <h2>Spis treści</h2>
            <TocList sections={sections} />
          </nav>
        ) : (
          <SidePanel title="Spis treści" drawerOnly>
            {(close) => (
              <nav className="basics__toc-drawer" aria-label="Spis treści">
                <TocList sections={sections} onNavigate={close} />
              </nav>
            )}
          </SidePanel>
        )}

        <div className="basics__content">
          {before}
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="basics-section"
              aria-labelledby={`${section.id}-tytul`}
            >
              <h2 id={`${section.id}-tytul`}>
                {index + 1}. {section.title}
              </h2>
              {section.intro.map((paragraph, i) => (
                <p key={i}>
                  <InlineText text={paragraph} />
                </p>
              ))}
              {renderExamples(section)}
              {section.tips && (
                <ul className="basics-tips" aria-label="Wskazówki">
                  {section.tips.map((tip, i) => (
                    <li key={i}>
                      <InlineText text={tip} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

function TocList({
  sections,
  onNavigate,
}: {
  sections: BasicsSectionShell[];
  onNavigate?: () => void;
}) {
  return (
    <ol>
      {sections.map((section) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            onClick={(event) => {
              scrollToSection(event, section.id);
              onNavigate?.();
            }}
          >
            {section.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * Router działa na `#`, więc zwykły link `#sekcja` zmieniłby trasę.
 * Przewijamy do sekcji ręcznie, bez zmiany adresu.
 */
function scrollToSection(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault();
  // Płynność przewijania zależy od CSS (scroll-behavior) i ustawień „mniej animacji”.
  document.getElementById(id)?.scrollIntoView?.({ block: 'start' });
}
