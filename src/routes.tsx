import { Navigate, type RouteObject } from 'react-router';
import { BasicsSection } from './components/BasicsLayout';
import { Layout } from './components/Layout';
import { AlgorithmsBasicsPage } from './pages/AlgorithmsBasicsPage';
import { ExcelBasicsPage } from './pages/ExcelBasicsPage';
import { ExcelTaskPage } from './pages/ExcelTaskPage';
import { ExcelTasksPage } from './pages/ExcelTasksPage';
import { HelpPage } from './pages/HelpPage';
import { LandingPage } from './pages/LandingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OpenTaskPage } from './pages/OpenTaskPage';
import { PythonBasicsPage } from './pages/PythonBasicsPage';
import { SessionPage } from './pages/SessionPage';
import { SessionsPage } from './pages/SessionsPage';
import { SqlBasicsPage } from './pages/SqlBasicsPage';
import { SqlTaskPage } from './pages/SqlTaskPage';
import { SqlTasksPage } from './pages/SqlTasksPage';
import { TaskPage } from './pages/TaskPage';
import { TasksPage } from './pages/TasksPage';
import { TasksSection } from './pages/TasksSection';
import { TheoryBasicsPage } from './pages/TheoryBasicsPage';
import { TheoryTaskPage } from './pages/TheoryTaskPage';
import { TheoryTasksPage } from './pages/TheoryTasksPage';

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
          { path: 'test', element: <TheoryTasksPage /> },
        ],
      },
      { path: 'zadanie/:taskId', element: <TaskPage /> },
      { path: 'excel', element: <Navigate to="/zadania/excel" replace /> },
      { path: 'excel/:taskId', element: <ExcelTaskPage /> },
      { path: 'sql', element: <Navigate to="/zadania/sql" replace /> },
      { path: 'sql/:taskId', element: <SqlTaskPage /> },
      { path: 'test', element: <Navigate to="/zadania/test" replace /> },
      { path: 'test/:taskId', element: <TheoryTaskPage /> },
      { path: 'test/otwarte/:taskId', element: <OpenTaskPage /> },
      { path: 'arkusze', element: <SessionsPage /> },
      { path: 'arkusze/:year/:slug', element: <SessionPage /> },
      {
        path: 'podstawy',
        element: <BasicsSection />,
        children: [
          { index: true, element: <Navigate to="python" replace /> },
          { path: 'python', element: <PythonBasicsPage /> },
          { path: 'excel', element: <ExcelBasicsPage /> },
          { path: 'sql', element: <SqlBasicsPage /> },
          { path: 'teoria', element: <TheoryBasicsPage /> },
          { path: 'algorytmy', element: <AlgorithmsBasicsPage /> },
        ],
      },
      { path: 'python', element: <Navigate to="/podstawy/python" replace /> },
      { path: 'pomoc', element: <HelpPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
