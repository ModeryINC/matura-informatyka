import { Link } from 'react-router';
import type { SolutionStatus } from '../lib/search';
import type { ExamSession, Task } from '../types';
import { StatusBadge } from './StatusBadge';
import { TopicList } from './TopicBadge';

interface TaskCardProps {
  task: Task;
  session: ExamSession | undefined;
  status: SolutionStatus;
}

export function TaskCard({ task, session, status }: TaskCardProps) {
  return (
    <article className="task-card">
      <header className="task-card__header">
        <p className="task-card__meta">
          {session ? `${session.label} ${session.year}` : task.sessionId} · zad. {task.number} ·{' '}
          {task.part === 1 ? 'część 1' : 'część 2'} · {task.points} pkt
        </p>
        <StatusBadge status={status} />
      </header>
      <h3 className="task-card__title">
        <Link to={`/zadanie/${encodeURIComponent(task.id)}`} className="stretched-link">
          {task.title}
        </Link>
      </h3>
      <p className="task-card__summary">{task.summary}</p>
      <TopicList topics={task.topics} />
      {task.restrictions && (
        <p className="restriction-badge" title={task.restrictions.note}>
          ⚠ Bez funkcji wbudowanych
        </p>
      )}
    </article>
  );
}
