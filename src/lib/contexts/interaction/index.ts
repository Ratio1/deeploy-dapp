export { InteractionContext } from './context';
export type { InteractionContextType } from './context';
export { useInteractionContext } from './hook';
export { InteractionProvider } from './interaction-provider';

export interface ConfirmOptions {
    onConfirm?: () => Promise<any>;
    modalSize?: 'sm' | 'md' | 'lg';
    confirmButtonClassNames?: string;
}
