import { useId } from 'react';
import type { SolutionStatus, TaskFilters as Filters } from '../lib/search';
import { TOPICS, type TopicId } from '../types';
import { STATUS_LABELS } from '../lib/status';

interface TaskFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  topicCounts: Map<TopicId, number>;
  years: number[];
}

/** Panel wyszukiwania: fraza, tematy (przełączniki), rok, część arkusza i status. */
export function TaskFilters({ filters, onChange, topicCounts, years }: TaskFiltersProps) {
  const id = useId();
  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const toggleTopic = (topic: TopicId) =>
    update({
      topics: filters.topics.includes(topic)
        ? filters.topics.filter((t) => t !== topic)
        : [...filters.topics, topic],
    });
  const availableTopics = (Object.keys(TOPICS) as TopicId[]).filter((t) => topicCounts.has(t));
  const hasFilters =
    filters.query !== '' ||
    filters.topics.length > 0 ||
    filters.years.length > 0 ||
    filters.part !== null ||
    filters.status !== null;

  return (
    <search className="filters" aria-label="Wyszukiwanie zadań">
      <div className="field field--search">
        <label htmlFor={`${id}-q`}>Szukaj</label>
        <input
          id={`${id}-q`}
          type="search"
          placeholder="np. rekurencja, palindrom, 2024…"
          value={filters.query}
          onChange={(event) => update({ query: event.target.value })}
        />
      </div>

      <div className="filters__row">
        <div className="field">
          <label htmlFor={`${id}-year`}>Rok</label>
          <select
            id={`${id}-year`}
            value={filters.years[0] ?? ''}
            onChange={(event) =>
              update({ years: event.target.value ? [Number(event.target.value)] : [] })
            }
          >
            <option value="">Wszystkie</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${id}-part`}>Część</label>
          <select
            id={`${id}-part`}
            value={filters.part ?? ''}
            onChange={(event) =>
              update({
                part: event.target.value === '' ? null : (Number(event.target.value) as 1 | 2),
              })
            }
          >
            <option value="">Obie</option>
            <option value="1">1 – teoretyczna</option>
            <option value="2">2 – przy komputerze</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${id}-status`}>Status</label>
          <select
            id={`${id}-status`}
            value={filters.status ?? ''}
            onChange={(event) =>
              update({
                status: event.target.value === '' ? null : (event.target.value as SolutionStatus),
              })
            }
          >
            <option value="">Dowolny</option>
            {(Object.keys(STATUS_LABELS) as SolutionStatus[]).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="topics">
        <legend>Tematy</legend>
        <div className="topics__list">
          {availableTopics.map((topic) => (
            <button
              key={topic}
              type="button"
              className="chip"
              aria-pressed={filters.topics.includes(topic)}
              onClick={() => toggleTopic(topic)}
            >
              {TOPICS[topic]} <span className="chip__count">{topicCounts.get(topic)}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {hasFilters && (
        <button
          type="button"
          className="button button--ghost"
          onClick={() => onChange({ query: '', topics: [], years: [], part: null, status: null })}
        >
          Wyczyść filtry
        </button>
      )}
    </search>
  );
}
