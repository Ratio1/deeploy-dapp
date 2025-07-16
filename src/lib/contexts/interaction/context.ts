import { createContext } from 'react';

export type InteractionContextType = (content: React.ReactNode) => Promise<boolean>;

export const InteractionContext = createContext<InteractionContextType | null>(null);
