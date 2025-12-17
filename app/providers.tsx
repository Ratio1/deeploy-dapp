'use client';

import { Wrappers } from '@lib/providers/wrappers';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    return <Wrappers>{children}</Wrappers>;
}
