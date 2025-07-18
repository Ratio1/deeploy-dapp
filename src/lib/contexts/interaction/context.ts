import { createContext } from 'react';

export type InteractionContextType = (content: React.ReactNode, onConfirm?: () => Promise<any>) => Promise<boolean>;

export const InteractionContext = createContext<InteractionContextType | null>(null);
