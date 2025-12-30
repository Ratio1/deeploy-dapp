import type { ReactNode } from 'react';
import { ProtectedLayout } from './protected-layout';

export default function ProtectedGroupLayout({ children }: { children: ReactNode }) {
    return <ProtectedLayout>{children}</ProtectedLayout>;
}
