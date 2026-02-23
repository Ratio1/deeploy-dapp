'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

const DEFAULT_MESSAGE = 'You have unsaved changes. Are you sure you want to leave this page?';

interface UseUnsavedChangesGuardProps {
    isDirty: boolean;
    message?: string;
}

export default function useUnsavedChangesGuard({ isDirty, message = DEFAULT_MESSAGE }: UseUnsavedChangesGuardProps) {
    const router = useRouter();
    const isRevertingHistoryRef = useRef(false);

    const confirmNavigation = useCallback(() => {
        if (!isDirty) {
            return true;
        }

        return window.confirm(message);
    }, [isDirty, message]);

    const runWithGuard = useCallback(
        (navigationAction: () => void) => {
            if (!confirmNavigation()) {
                return false;
            }

            navigationAction();
            return true;
        },
        [confirmNavigation],
    );

    useEffect(() => {
        if (!isDirty) {
            return;
        }

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };

        const handleDocumentClick = (event: MouseEvent) => {
            if (event.defaultPrevented || event.button !== 0) {
                return;
            }

            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }

            const target = event.target as HTMLElement | null;
            const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;

            if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) {
                return;
            }

            const href = anchor.getAttribute('href');

            if (
                !href ||
                href.startsWith('#') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                href.startsWith('javascript:')
            ) {
                return;
            }

            const targetUrl = new URL(anchor.href, window.location.href);

            if (targetUrl.origin !== window.location.origin) {
                return;
            }

            const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
            const nextPath = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;

            if (currentPath === nextPath) {
                return;
            }

            event.preventDefault();

            if (!window.confirm(message)) {
                return;
            }

            router.push(nextPath);
        };

        const handlePopState = () => {
            if (isRevertingHistoryRef.current) {
                isRevertingHistoryRef.current = false;
                return;
            }

            if (window.confirm(message)) {
                return;
            }

            isRevertingHistoryRef.current = true;
            window.history.go(1);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('click', handleDocumentClick, true);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('click', handleDocumentClick, true);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isDirty, message, router]);

    return { confirmNavigation, runWithGuard };
}
