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

    useEffect(() => {
        if (!isNavigationBlocked) {
            return;
        }

        const handleDocumentClick = (event: MouseEvent) => {
            if (allowNavigationRef.current || event.defaultPrevented) {
                return;
            }

            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }

            const target = event.target as HTMLElement | null;
            const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;

            if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) {
                return;
            }

            const destinationUrl = new URL(anchor.href, window.location.href);
            const currentUrl = new URL(window.location.href);

            if (destinationUrl.href === currentUrl.href) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            void confirmNavigation(() => {
                window.location.assign(destinationUrl.href);
            });
        };

        document.addEventListener('click', handleDocumentClick, true);

        return () => {
            document.removeEventListener('click', handleDocumentClick, true);
        };
    }, [confirmNavigation, isNavigationBlocked]);

    useEffect(() => {
        if (!isNavigationBlocked) {
            return;
        }

        const handlePopState = () => {
            if (allowNavigationRef.current) {
                return;
            }

            const confirmed = window.confirm(message);

            if (confirmed) {
                allowNavigationRef.current = true;

                window.setTimeout(() => {
                    allowNavigationRef.current = false;
                }, 500);

                return;
            }

            allowNavigationRef.current = true;
            window.history.go(1);

            window.setTimeout(() => {
                allowNavigationRef.current = false;
            }, 0);
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isNavigationBlocked, message]);

    return {
        isNavigationBlocked,
        confirmNavigation,
    };
}
