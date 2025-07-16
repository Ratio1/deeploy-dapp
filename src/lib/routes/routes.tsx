import { DeploymentProvider } from '@lib/contexts/deployment';
import NotFound from '@pages/404';
import Account from '@pages/Account';
import CSP from '@pages/CSP';
import CreateProject from '@pages/deeploys/CreateProject';
import Dashboard from '@pages/deeploys/Dashboard';
import LegacyRequester from '@pages/deeploys/LegacyRequester';
import Project from '@pages/deeploys/Project';
import Docs from '@pages/Docs';
import Home from '@pages/Home';
import Support from '@pages/Support';
import { JSX } from 'react';
import { RiBox3Line, RiFileTextLine, RiHeadphoneLine, RiHomeLine, RiUser3Line } from 'react-icons/ri';
import { routePath } from './route-paths';

export type BaseRoute = {
    path: string;
    icon?: JSX.Element;
};

export type SimpleRoute = BaseRoute & {
    page: () => JSX.Element;
};

export type ChildRoute = {
    path: string;
    page: () => JSX.Element;
};

export type ParentRoute = BaseRoute & {
    children: ChildRoute[];
};

export type AppRoute = SimpleRoute | ParentRoute;

export function isSimpleRoute(route: AppRoute): route is SimpleRoute {
    return 'page' in route;
}

export function isParentRoute(route: AppRoute): route is ParentRoute {
    return 'children' in route;
}

export const routeInfo = {
    [routePath.home]: {
        title: 'Deeploy',
        description: 'Fast app deployment & go-to-market',
        routeTitle: 'Home',
    },
    [routePath.deeploys]: {
        title: 'Deeploys',
        description: 'View, organize & deeploy your projects',
    },
    [`${routePath.deeploys}/${routePath.dashboard}`]: {
        title: 'Dashboard',
        description: 'An organized view of your deeployed projects',
    },
    [`${routePath.deeploys}/${routePath.createProject}`]: {
        title: 'Deployment',
        description: 'Create and configure a new project for deployment',
        routeTitle: 'Create Project',
    },
    [`${routePath.deeploys}/${routePath.project}`]: {
        title: 'Project',
        description: 'Create, edit and deploy your project',
    },
    [`${routePath.deeploys}/${routePath.legacyRequester}`]: {
        title: 'Legacy Requester',
        description: 'Legacy interface for requesting deployments',
        routeTitle: 'Legacy Requester',
    },
    [routePath.account]: {
        title: 'Account',
        description: 'Manage your account & billing settings',
    },
    [routePath.docs]: {
        title: 'Documentation',
        description: 'Access helpful guides and resources',
    },
    [routePath.support]: {
        title: 'Support',
        description: 'Get help and contact our support team',
    },
    [routePath.notFound]: {
        title: 'Not Found',
    },
    [routePath.notAllowed]: {
        title: 'Not Allowed',
    },
};

// Routes with icons are displayed in the main navigation
export const routes: AppRoute[] = [
    {
        path: routePath.home,
        page: Home,
        icon: <RiHomeLine />,
    },
    {
        path: routePath.deeploys,
        icon: <RiBox3Line />,
        children: [
            {
                path: routePath.dashboard,
                page: Dashboard,
            },
            {
                path: routePath.createProject,
                page: () => (
                    <DeploymentProvider>
                        <CreateProject />
                    </DeploymentProvider>
                ),
            },
            {
                path: routePath.legacyRequester,
                page: LegacyRequester,
            },
        ],
    },
    {
        path: routePath.account,
        page: Account,
        icon: <RiUser3Line />,
    },
    {
        path: routePath.docs,
        page: Docs,
        icon: <RiFileTextLine />,
    },
    {
        path: routePath.support,
        page: Support,
        icon: <RiHeadphoneLine />,
    },
    // Routes which are not displayed in the main navigation
    {
        path: `${routePath.deeploys}/${routePath.project}/:id`,
        page: () => (
            <DeploymentProvider>
                <Project />
            </DeploymentProvider>
        ),
    },
    {
        path: routePath.notFound,
        page: NotFound,
    },
    {
        path: routePath.notAllowed,
        page: CSP,
    },
];
