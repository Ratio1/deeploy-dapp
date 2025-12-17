import ScrollToTop from '@components/layout/ScrollToTop';
import { HeroUIProvider } from '@heroui/system';
import { DeploymentProvider } from '@lib/contexts/deployment';
import { InteractionProvider } from '@lib/contexts/interaction';
import { TunnelsProvider } from '@lib/contexts/tunnels';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthenticationProvider } from '../contexts/authentication';
import { BlockchainProvider } from '../contexts/blockchain';
import { Web3Provider } from './Web3Provider';

export function Wrappers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <Web3Provider>
            <QueryClientProvider client={queryClient}>
                <HeroUIProvider>
                    <AuthenticationProvider>
                        <BlockchainProvider>
                            <DeploymentProvider>
                                <TunnelsProvider>
                                    <InteractionProvider>{children}</InteractionProvider>
                                </TunnelsProvider>
                            </DeploymentProvider>
                        </BlockchainProvider>
                    </AuthenticationProvider>

                    <Toaster
                        containerStyle={{
                            top: 30,
                            left: 30,
                            bottom: 30,
                            right: 30,
                        }}
                        toastOptions={{
                            className: 'font-mona text-base',
                            duration: 5000,
                        }}
                    />

                    <ScrollToTop />
                </HeroUIProvider>
            </QueryClientProvider>
        </Web3Provider>
    );
}
