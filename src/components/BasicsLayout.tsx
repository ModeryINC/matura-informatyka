import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { InlineText } from './HintText';

const TABS = [
  { to: '/podstawy/python', label: 'Python' },
  { to: '/podstawy/excel', label: 'Excel' },
  { to: '/podstawy/sql', label: 'SQL' },
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

/** Wspólny układ podstron „Podstawy …”: zakładki, spis treści i działy. */
export function BasicsLayout<S extends BasicsSectionShell>({
  title,
  lead,
  sections,
  renderExamples,
  before,
}: BasicsLayoutProps<S>) {
  return (
    <div className="page page--basics">
      <header className="basics-header">
        <nav aria-label="Podstawy" className="tabs basics-header__tabs">
          {TABS.map((tab) => (
            <NavLink key={tab.to} to={tab.to} className="tabs__tab" viewTransition>
              {tab.label}
            </NavLink>
          ))}
        </nav>
        <h1>{title}</h1>
        {lead}
      </header>

      <div className="basics">
        <nav className="basics__toc" aria-label="Spis treści">
          <h2>Spis treści</h2>
          <ol>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} onClick={(event) => scrollToSection(event, section.id)}>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

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
    </div>
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
