import type { RouteObject } from 'react-router';
import { Layout } from './components/Layout';
import { HelpPage } from './pages/HelpPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SessionPage } from './pages/SessionPage';
import { SessionsPage } from './pages/SessionsPage';
import { TaskPage } from './pages/TaskPage';
import { TasksPage } from './pages/TasksPage';

/**
 * Trasy aplikacji (w osobnym pliku, żeby `App.tsx` eksportował tylko komponent –
 * wymóg React Fast Refresh). Używamy routera opartego na `#`, bo GitHub Pages
 * nie obsługuje przepisywania adresów – wejście wprost na `/zadanie/...`
 * zwróciłoby 404.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <TasksPage /> },
      { path: 'zadanie/:taskId', element: <TaskPage /> },
      { path: 'arkusze', element: <SessionsPage /> },
      { path: 'arkusze/:year/:slug', element: <SessionPage /> },
      { path: 'pomoc', element: <HelpPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
