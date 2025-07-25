import { createContext } from 'react';
import { ConfirmOptions } from '.';

export type InteractionContextType = (content: React.ReactNode, options?: ConfirmOptions) => Promise<boolean>;

export const InteractionContext = createContext<InteractionContextType | null>(null);
