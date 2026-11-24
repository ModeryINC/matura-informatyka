import { TOPICS, type TopicId } from '../types';

export function TopicList({ topics }: { topics: TopicId[] }) {
  return (
    <ul className="tag-list" aria-label="Tematy">
      {topics.map((topic) => (
        <li key={topic} className="tag">
          {TOPICS[topic]}
        </li>
      ))}
    </ul>
  );
}
