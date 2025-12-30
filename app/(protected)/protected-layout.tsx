'use client';

import Layout from '@components/layout/Layout';
import { Spinner } from '@heroui/spinner';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAccount } from 'wagmi';

export function ProtectedLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
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
            router.replace('/login');
        }
    }, [shouldRedirectToLogin, router]);

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
