'use client';

import Layout from '@components/layout/Layout';
import { Spinner } from '@heroui/spinner';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAccount } from 'wagmi';

export function ProtectedLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { isSignedIn } = useAuthenticationContext() as AuthenticationContextType;
    const { isFetchAppsRequired, setFetchAppsRequired, setApps } = useDeploymentContext() as DeploymentContextType;
    const account = useAccount();
    const { address } = isUsingDevAddress ? getDevAddress() : account;

    const isAuthenticated = isSignedIn && address !== undefined && isFetchAppsRequired !== undefined;
    const shouldRedirectToLogin = !isAuthenticated;

    useEffect(() => {
        if (account.status === 'disconnected') {
            setFetchAppsRequired(undefined);
            setApps({});
        }
    }, [account.status, setApps, setFetchAppsRequired]);

    useEffect(() => {
        if (shouldRedirectToLogin) {
            const search = searchParams.toString();
            const requestedPath = search ? `${pathname}?${search}` : pathname;
            const loginPath = `/login?next=${encodeURIComponent(requestedPath)}`;
            router.replace(loginPath);
        }
    }, [pathname, router, searchParams, shouldRedirectToLogin]);

    if (shouldRedirectToLogin) {
        return (
            <div className="center-all h-screen w-full flex-1">
                <div className="col items-center gap-2.5">
                    <Spinner />
                    <div className="font-medium">Redirecting to login</div>
                </div>
            </div>
        );
    }

    return <Layout>{children}</Layout>;
}
