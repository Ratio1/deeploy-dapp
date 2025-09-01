import { createContext } from 'react';
import { ConfirmOptions } from '.';

export interface InteractionContextType {
    confirm: (content: React.ReactNode, options?: ConfirmOptions) => Promise<boolean>;
    openSignMessageModal: () => void;
    closeSignMessageModal: () => void;
}

export const InteractionContext = createContext<InteractionContextType | null>(null);
