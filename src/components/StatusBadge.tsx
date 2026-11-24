import type { SolutionStatus } from '../lib/search';
import { STATUS_LABELS } from '../lib/status';

export function StatusBadge({ status }: { status: SolutionStatus }) {
  return (
    <span className={`status status--${status}`}>
      <span className="status__dot" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}
