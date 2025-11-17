import NotFound from '@pages/404';
import Account from '@pages/Account';
import CreateProject from '@pages/deeploys/CreateProject';
import Dashboard from '@pages/deeploys/Dashboard';
import EditJobDraft from '@pages/deeploys/drafts/EditJobDraft';
import ProjectDraft from '@pages/deeploys/drafts/ProjectDraft';
import EditJob from '@pages/deeploys/job/EditJob';
import ExtendJob from '@pages/deeploys/job/ExtendJob';
import Job from '@pages/deeploys/job/Job';
import LegacyRequester from '@pages/deeploys/LegacyRequester';
import Monitor from '@pages/deeploys/Monitor';
import Project from '@pages/deeploys/Project';
import Docs from '@pages/Docs';
import Home from '@pages/Home';
import Support from '@pages/Support';
import TunnelPage from '@pages/tunnels/TunnelPage';
import Tunnels from '@pages/tunnels/Tunnels';
import { JSX } from 'react';
import { RiBox3Line, RiCodeBoxLine, RiFileTextLine, RiHeadphoneLine, RiHomeLine, RiUser3Line } from 'react-icons/ri';
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
        description: 'View, organize & deploy your projects',
    },
    [`${routePath.deeploys}/${routePath.dashboard}`]: {
        title: 'Dashboard',
        description: 'An organized view of your deployed projects',
    },
    [`${routePath.deeploys}/${routePath.monitor}`]: {
        title: 'Monitor',
        description: 'Monitor recent or failed deployments and claim funds',
    },
    [`${routePath.deeploys}/${routePath.createProject}`]: {
        title: 'Deployment',
        description: 'Create and configure a new project for deployment',
        routeTitle: 'Create Project',
    },
    [`${routePath.deeploys}/${routePath.projectDraft}`]: {
        title: 'Project Draft',
        description: 'Edit, pay and deploy your project draft',
    },
    [`${routePath.deeploys}/${routePath.project}`]: {
        title: 'Project',
        description: 'View and manage your project and its jobs',
    },
    [`${routePath.deeploys}/${routePath.job}`]: {
        title: 'Job',
        description: 'Inspect, manage & update your job',
    },
    [`${routePath.deeploys}/${routePath.legacyRequester}`]: {
        title: 'Legacy Requester',
        description: 'Legacy interface for requesting deployments',
        routeTitle: 'Legacy Requester',
    },
    [routePath.tunnels]: {
        title: 'Tunnels',
        description: 'Manage your tunnels and link them to your own domains',
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
                page: CreateProject,
            },
            {
                path: routePath.legacyRequester,
                page: LegacyRequester,
            },
            {
                path: routePath.monitor,
                page: Monitor,
            },
        ],
    },
    {
        path: routePath.tunnels,
        page: () => <Tunnels />,
        icon: <RiCodeBoxLine />,
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
        path: `${routePath.deeploys}/${routePath.projectDraft}/:projectHash`,
        page: () => <ProjectDraft />,
    },
    {
        path: `${routePath.deeploys}/${routePath.jobDraft}/:draftId`,
        page: () => <EditJobDraft />,
    },
    {
        path: `${routePath.deeploys}/${routePath.project}/:projectHash`,
        page: () => <Project />,
    },
    {
        path: `${routePath.deeploys}/${routePath.job}/:jobId`,
        page: () => <Job />,
    },
    {
        path: `${routePath.deeploys}/${routePath.job}/:jobId/${routePath.edit}`,
        page: () => <EditJob />,
    },
    {
        path: `${routePath.deeploys}/${routePath.job}/:jobId/${routePath.extend}`,
        page: () => <ExtendJob />,
    },
    {
        path: `${routePath.tunnels}/:id`,
        page: () => <TunnelPage />,
    },
    {
        path: routePath.notFound,
        page: NotFound,
    },
];
