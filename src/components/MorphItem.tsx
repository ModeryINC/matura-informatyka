import type { ReactNode } from 'react';
import { useMorphStyle } from '../hooks/useMorph';

interface MorphItemProps {
  /** Adres strony szczegółów, w którą element się „rozciąga”. */
  to: string;
  as?: 'li' | 'article';
  className?: string;
  children: ReactNode;
}

/** Element listy (karta, przycisk) rozciągający się w stronę szczegółów przy przejściu. */
export function MorphItem({ to, as: Tag = 'li', className, children }: MorphItemProps) {
  return (
    <Tag className={className} style={useMorphStyle(to)}>
      {children}
    </Tag>
  );
}
