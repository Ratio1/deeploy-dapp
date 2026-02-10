import { JSX } from 'react';
import { RiBox3Line, RiCodeSSlashLine, RiHomeLine, RiUser3Line } from 'react-icons/ri';
import { routePath } from './route-paths';

export type BaseRoute = {
    path: string;
    icon?: JSX.Element;
};

export type ChildRoute = {
    path: string;
};

export type ParentRoute = BaseRoute & {
    children: ChildRoute[];
};

export type AppRoute = ParentRoute | BaseRoute;

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
    [`${routePath.deeploys}/${routePath.expired}`]: {
        title: 'Expired Jobs',
        description: 'View closed jobs and fetch their pipeline payloads from R1FS',
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
        icon: <RiHomeLine />,
    },
    {
        path: routePath.deeploys,
        icon: <RiBox3Line />,
        children: [
            {
                path: routePath.dashboard,
            },
            {
                path: routePath.createProject,
            },
            {
                path: routePath.monitor,
            },
            {
                path: routePath.expired,
            },
            {
                path: routePath.legacyRequester,
            },
        ],
    },
    {
        path: routePath.tunnels,
        icon: <RiCodeSSlashLine />,
    },
    {
        path: routePath.account,
        icon: <RiUser3Line />,
    },
    // {
    //     path: routePath.docs,
    //     icon: <RiFileTextLine />,
    // },
    // {
    //     path: routePath.support,
    //     icon: <RiHeadphoneLine />,
    // },
    // Routes which are not displayed in the main navigation
    {
        path: `${routePath.deeploys}/${routePath.projectDraft}/:projectHash`,
    },
    {
        path: `${routePath.deeploys}/${routePath.jobDraft}/:draftId`,
    },
    {
        path: `${routePath.deeploys}/${routePath.project}/:projectHash`,
    },
    {
        path: `${routePath.deeploys}/${routePath.job}/:jobId`,
    },
    {
        path: `${routePath.deeploys}/${routePath.job}/:jobId/${routePath.edit}`,
    },
    {
        path: `${routePath.deeploys}/${routePath.job}/:jobId/${routePath.extend}`,
    },
    {
        path: `${routePath.tunnels}/:id`,
    },
    {
        path: routePath.notFound,
    },
];
