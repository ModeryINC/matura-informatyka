import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';

/** Renderuje element w routerze pamięciowym pod wskazanym adresem. */
export function renderAt(path: string, routes: RouteObject[]) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return { router, ...render(<RouterProvider router={router} />) };
}

/** Renderuje pojedynczy komponent w minimalnym routerze (np. dla <Link>). */
export function renderWithRouter(element: ReactElement, path = '/') {
  return renderAt(path, [{ path: '*', element }]);
}
