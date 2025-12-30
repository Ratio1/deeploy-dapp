import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

process.env.NEXT_PUBLIC_ENVIRONMENT ??= 'testnet';
process.env.NEXT_PUBLIC_API_URL ??= 'http://localhost';

const fallbackRandomUUID = () => '00000000-0000-0000-0000-000000000000' as const;

if (!globalThis.crypto) {
    globalThis.crypto = {
        randomUUID: fallbackRandomUUID,
    } as Crypto;
} else if (!globalThis.crypto.randomUUID) {
    globalThis.crypto.randomUUID = fallbackRandomUUID;
}

Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: globalThis.crypto.randomUUID,
    writable: true,
    configurable: true,
});

if (!window.matchMedia) {
    window.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    });
}

Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true,
});

class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

class IntersectionObserverMock implements IntersectionObserver {
    root: Element | Document | null = null;
    rootMargin = '';
    scrollMargin = '';
    thresholds: ReadonlyArray<number> = [];

    constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}

    disconnect() {}
    observe(_target: Element) {}
    takeRecords(): IntersectionObserverEntry[] {
        return [];
    }
    unobserve(_target: Element) {}
}

globalThis.ResizeObserver = ResizeObserver;
globalThis.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

Object.defineProperty(navigator, 'clipboard', {
    value: {
        readText: vi.fn().mockResolvedValue(''),
        writeText: vi.fn().mockResolvedValue(undefined),
    },
    configurable: true,
});

let server: typeof import('./mocks/server').server;

beforeAll(async () => {
    const mod = await import('./mocks/server');
    server = mod.server;
    server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
