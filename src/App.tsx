import Layout from '@components/layout/Layout';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath } from '@lib/routes/route-paths';
import { routes } from '@lib/routes/routes';
import { JSX, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAccount } from 'wagmi';

function App() {
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;
    const { setR1Balance } = useBlockchainContext() as BlockchainContextType;

    const { address } = useAccount();

    useEffect(() => {
        if (!address && !authenticated) {
            console.log('User not authenticated');
            setR1Balance(0n);
        }
    }, [address, authenticated]);

    return (
        <>
            <Routes>
                <Route path={routePath.root} element={<Layout />}>
                    {/* <Route path="/" element={<Navigate to={routePath.root} replace />} /> */}

                    {routes
                        .filter((route) => !!route.page)
                        .map((route, index) => {
                            const Page = route.page as () => JSX.Element;
                            return <Route key={'route-key-' + index} path={route.path} element={<Page />} />;
                        })}
                </Route>

                <Route path="*" element={<Navigate to={routePath.notFound} replace />} />
            </Routes>

            {/* Global overlays */}
        </>
    );
}

export default App;
