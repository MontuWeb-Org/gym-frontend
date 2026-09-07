'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (process.env.NEXT_PUBLIC_ENABLE_MOCKS === 'true') {
        const { initMocks } = await import('./index');
        await initMocks();
      }
      setMswReady(true);
    };

    init();
  }, []);

  if (process.env.NEXT_PUBLIC_ENABLE_MOCKS === 'true' && !mswReady) {
    return null;
  }

  return <>{children}</>;
}