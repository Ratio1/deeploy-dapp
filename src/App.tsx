import Layout from '@components/layout/Layout';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath } from '@lib/routes/route-paths';
import { isParentRoute, isSimpleRoute, routes } from '@lib/routes/routes';
import { useEffect } from 'react';
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
                    <Route path="/" element={<Navigate to={routePath.home} replace />} />

                    {routes.map((route, index) => {
                        if (isSimpleRoute(route)) {
                            return <Route key={'route-key-' + index} path={route.path} element={<route.page />} />;
                        } else if (isParentRoute(route) && route.children && route.children.length > 0) {
                            return (
                                <Route key={'route-key-' + index} path={route.path}>
                                    <Route index element={<Navigate to={route.children[0].path} replace />} />

                                    {route.children.map((child, childIndex) => (
                                        <Route
                                            key={'child-route-key-' + childIndex}
                                            path={child.path}
                                            element={<child.page />}
                                        />
                                    ))}
                                </Route>
                            );
                        }

                        // Fallback (not necessary if routes are validated)
                        return null;
                    })}
                </Route>

                <Route path="*" element={<Navigate to={routePath.notFound} replace />} />
            </Routes>

            {/* Global overlays */}
        </>
    );
}

export default App;
