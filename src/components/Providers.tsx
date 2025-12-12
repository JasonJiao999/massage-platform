'use client';

import { ReactNode } from 'react';
import { WagmiProvider } from './payment/WagmiProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider>
      {children}
    </WagmiProvider>
  );
}
