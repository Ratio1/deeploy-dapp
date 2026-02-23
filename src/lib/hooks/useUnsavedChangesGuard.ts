'use client';

import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { useCallback, useEffect, useRef } from 'react';

const DEFAULT_MESSAGE = 'You have unsaved changes. Are you sure you want to leave this page?';

interface UseUnsavedChangesGuardOptions {
    isDirty: boolean;
    isSubmitting?: boolean;
    message?: string;
}

export function useUnsavedChangesGuard({
    isDirty,
    isSubmitting = false,
    message = DEFAULT_MESSAGE,
}: UseUnsavedChangesGuardOptions) {
    const interaction = useInteractionContext() as InteractionContextType | null;
    const isNavigationBlocked = isDirty && !isSubmitting;
    const allowNavigationRef = useRef(false);
    const isPromptOpenRef = useRef(false);

    const requestConfirmation = useCallback(async () => {
        if (!isNavigationBlocked || allowNavigationRef.current) {
            return true;
        }

        if (isPromptOpenRef.current) {
            return false;
        }

        isPromptOpenRef.current = true;

        try {
            if (!interaction?.confirm) {
                return window.confirm(message);
            }

            return await interaction.confirm(message, {
                confirmButtonClassNames: 'bg-slate-900',
            });
        } finally {
            isPromptOpenRef.current = false;
        }
    }, [interaction, isNavigationBlocked, message]);

    const confirmNavigation = useCallback(
        async (action: () => void | Promise<void>) => {
            const confirmed = await requestConfirmation();

            if (!confirmed) {
                return false;
            }

            allowNavigationRef.current = true;

            try {
                await action();
                return true;
            } finally {
                window.setTimeout(() => {
                    allowNavigationRef.current = false;
                }, 500);
            }
        },
        [requestConfirmation],
    );

    useEffect(() => {
        if (!isNavigationBlocked) {
            return;
        }

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (allowNavigationRef.current) {
                return;
            }

            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isNavigationBlocked]);

    return {
        isNavigationBlocked,
        confirmNavigation,
    };
}
