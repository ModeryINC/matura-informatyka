import { Navigate, type RouteObject } from 'react-router';
import { Layout } from './components/Layout';
import { ExcelTaskPage } from './pages/ExcelTaskPage';
import { ExcelTasksPage } from './pages/ExcelTasksPage';
import { HelpPage } from './pages/HelpPage';
import { LandingPage } from './pages/LandingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PythonBasicsPage } from './pages/PythonBasicsPage';
import { SessionPage } from './pages/SessionPage';
import { SessionsPage } from './pages/SessionsPage';
import { SqlTasksPage } from './pages/SqlTasksPage';
import { TaskPage } from './pages/TaskPage';
import { TasksPage } from './pages/TasksPage';
import { TasksSection } from './pages/TasksSection';

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
      { index: true, element: <LandingPage /> },
      {
        path: 'zadania',
        element: <TasksSection />,
        children: [
          { index: true, element: <Navigate to="python" replace /> },
          { path: 'python', element: <TasksPage /> },
          { path: 'excel', element: <ExcelTasksPage /> },
          { path: 'sql', element: <SqlTasksPage /> },
        ],
      },
      { path: 'zadanie/:taskId', element: <TaskPage /> },
      { path: 'excel', element: <Navigate to="/zadania/excel" replace /> },
      { path: 'excel/:taskId', element: <ExcelTaskPage /> },
      { path: 'arkusze', element: <SessionsPage /> },
      { path: 'arkusze/:year/:slug', element: <SessionPage /> },
      { path: 'python', element: <PythonBasicsPage /> },
      { path: 'pomoc', element: <HelpPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
