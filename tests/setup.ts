import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  // Testy Workera działają w środowisku Node, bez localStorage.
  if (typeof localStorage !== 'undefined') localStorage.clear();
});
