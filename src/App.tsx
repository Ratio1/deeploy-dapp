import Layout from '@components/layout/Layout';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { routePath } from '@lib/routes/route-paths';
import { isParentRoute, isSimpleRoute, routes } from '@lib/routes/routes';
import Login from '@pages/Login';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAccount } from 'wagmi';

function App() {
    const { isSignedIn } = useAuthenticationContext() as AuthenticationContextType;
    const { isFetchAppsRequired } = useDeploymentContext() as DeploymentContextType;

    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();

    const isAuthenticated = isSignedIn && address !== undefined && isFetchAppsRequired !== undefined;

    if (isAuthenticated) {
        return (
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

                {/* Once logged in, the rendered routes will change and the user will consequently be routed here */}
                <Route path={routePath.login} element={<Navigate to={routePath.home} replace />} />

                <Route path="*" element={<Navigate to={routePath.notFound} replace />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path={routePath.login} element={<Login />} />
            <Route path="*" element={<Navigate to={routePath.login} replace />} />
        </Routes>
    );
}

export default App;
