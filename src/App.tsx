import { createHashRouter } from 'react-router';
// RouterProvider z `react-router/dom` obsługuje przejścia widoków (View Transitions).
import { RouterProvider } from 'react-router/dom';
import { routes } from './routes';

const router = createHashRouter(routes);

export function App() {
  return <RouterProvider router={router} />;
}
