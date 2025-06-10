import Account from '@pages/Account';
import PrivacyPolicy from '@pages/compliance/PrivacyPolicy';
import TermsAndConditions from '@pages/compliance/T&C';
import Dashboard from '@pages/deeploys/Dashboard';
import DeeployApp from '@pages/deeploys/DeeployApp';
import Docs from '@pages/Docs';
import Home from '@pages/Home';
import Support from '@pages/Support';
import { JSX } from 'react';
import { RiBox3Line, RiFileTextLine, RiHeadphoneLine, RiHomeLine, RiShieldLine, RiUser3Line } from 'react-icons/ri';
import { routePath } from './route-paths';

export type BaseRoute = {
    path: string;
    icon: JSX.Element;
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
        description: 'Fast app development & go-to-market',
        routeTitle: 'Home',
    },
    [routePath.deeploys]: {
        title: 'Deeploys',
        description: 'View, organize & deeploy your apps',
    },
    [`${routePath.deeploys}/${routePath.dashboard}`]: {
        title: 'Dashboard',
        description: 'An organized view of your deeployed apps',
    },
    [`${routePath.deeploys}/${routePath.deeployApp}`]: {
        title: 'Deeploy App',
        description: 'Create and configure a new app for deeployment',
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
    [routePath.compliance]: {
        title: 'Compliance',
    },
    [`${routePath.compliance}/${routePath.termsAndConditions}`]: {
        title: 'Terms & Conditions',
        description: 'Terms governing your use of our services',
    },
    [`${routePath.compliance}/${routePath.privacyPolicy}`]: {
        title: 'Privacy Policy',
        description: 'Understand how we handle and protect your personal data',
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
                path: routePath.deeployApp,
                page: DeeployApp,
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
    {
        path: routePath.compliance,
        icon: <RiShieldLine />,
        children: [
            {
                path: routePath.termsAndConditions,
                page: TermsAndConditions,
            },
            {
                path: routePath.privacyPolicy,
                page: PrivacyPolicy,
            },
        ],
    },
];
