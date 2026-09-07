let mockInitPromise: Promise<void> | null = null;

export function initMocks(): Promise<void> {
  if (mockInitPromise) {
    return mockInitPromise;
  }

  mockInitPromise = (async () => {
    if (typeof window === 'undefined') {
      const { server } = await import('./server');
      server.listen({ onUnhandledRequest: 'bypass' });
    } else {
      const { worker } = await import('./browser');
      await worker.start({ onUnhandledRequest: 'bypass' });
    }
  })();

  return mockInitPromise;
}