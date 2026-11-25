import { Link } from 'react-router';
import { MorphItem } from './MorphItem';
import type { SolutionStatus } from '../lib/search';
import type { ExamSession, Task } from '../types';
import { StatusBadge } from './StatusBadge';
import { TopicList } from './TopicBadge';
import { LuTriangleAlert } from 'react-icons/lu';

interface TaskCardProps {
  task: Task;
  session: ExamSession | undefined;
  status: SolutionStatus;
}

export function TaskCard({ task, session, status }: TaskCardProps) {
  const to = `/zadanie/${encodeURIComponent(task.id)}`;
  return (
    <MorphItem as="article" to={to} className="task-card">
      <header className="task-card__header">
        <p className="task-card__meta">
          {session ? `${session.label} ${session.year}` : task.sessionId} · zad. {task.number} ·{' '}
          {task.part === 1 ? 'część 1' : 'część 2'} · {task.points} pkt
        </p>
        <StatusBadge status={status} />
      </header>
      <h3 className="task-card__title">
        <Link to={to} className="stretched-link" viewTransition>
          {task.title}
        </Link>
      </h3>
      <p className="task-card__summary">{task.summary}</p>
      <TopicList topics={task.topics} />
      {task.restrictions && (
        <p className="restriction-badge" title={task.restrictions.note}>
          <LuTriangleAlert aria-hidden className="icon" /> Bez funkcji wbudowanych
        </p>
      )}
    </MorphItem>
  );
}
