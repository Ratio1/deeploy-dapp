import Layout from '@components/layout/Layout';
import { Spinner } from '@heroui/spinner';
import { getNodeLastEpoch } from '@lib/api/oracles';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath } from '@lib/routes/route-paths';
import { isParentRoute, isSimpleRoute, routes } from '@lib/routes/routes';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAccount, usePublicClient } from 'wagmi';

function App() {
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;
    const { setR1Balance, fetchLicenses } = useBlockchainContext() as BlockchainContextType;

    const [isLoading, setLoading] = useState(false);

    const { address } = useAccount();
    const navigate = useNavigate();
    const publicClient = usePublicClient();

    useEffect(() => {
        if (!address && !authenticated) {
            console.log('User not authenticated');
            setR1Balance(0n);
        }
    }, [address, authenticated]);

    useEffect(() => {
        if (!publicClient) {
            return;
        } else {
            if (authenticated && !!address && publicClient) {
                if (process.env.NODE_ENV !== 'development') {
                    checkOracleOwnership();
                }
            }
        }
    }, [authenticated, address, publicClient]);

    const checkOracleOwnership = async () => {
        setLoading(true);

        try {
            console.log('[checkOracleOwnership] Checking oracle ownership');

            const licenses = await fetchLicenses();
            const nodeResponses = await Promise.all(licenses.map((license) => getNodeLastEpoch(license.nodeAddress)));

            const hasOracle = nodeResponses.some((nodeResponse) => nodeResponse.node_is_oracle);
            console.log('[checkOracleOwnership] has oracle', hasOracle);

            if (!hasOracle) {
                navigate(routePath.notAllowed);
            }
        } catch (error) {
            console.error('Error checking oracle ownership', error);
            toast.error('Error checking oracle ownership.');
        } finally {
            setLoading(false);
        }
    };

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
            {isLoading && (
                <div className="center-all col backdrop-blur-xs fixed bottom-0 left-0 right-0 top-0 gap-6 bg-white/50 p-8">
                    <Spinner />
                </div>
            )}
        </>
    );
}

export default App;
