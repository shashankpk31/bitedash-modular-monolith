/**
 * Vitest Test Setup File
 *
 * WHY this file? Configures the test environment before each test runs.
 * - Extends expect with testing-library matchers
 * - Cleans up DOM after each test to prevent pollution
 * - Mocks browser APIs not available in jsdom
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// WHY extend expect? Adds custom matchers like toBeInTheDocument, toHaveClass, etc.
expect.extend(matchers);

// WHY cleanup? React Testing Library renders to a container that persists
// between tests. Cleanup ensures each test starts fresh.
afterEach(() => {
  cleanup();
});

// WHY mock matchMedia? jsdom doesn't implement matchMedia used by responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// WHY mock scrollTo? jsdom doesn't implement scroll methods
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// WHY mock ResizeObserver? Used by many UI libraries for responsive behavior
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// WHY mock IntersectionObserver? Used for lazy loading and infinite scroll
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// WHY mock localStorage? Provides isolated storage for each test
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
