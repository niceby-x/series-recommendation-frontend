import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Without vitest's `globals: true`, @testing-library/react can't detect
// afterEach on its own to auto-unmount between tests, so each test in a
// file would otherwise pile its render onto the DOM from the last one.
afterEach(() => {
  cleanup();
});
