import Home from '@pages/Home';
import { JSX } from 'react';
import { RiHomeLine } from 'react-icons/ri';
import { routePath } from './route-paths';

export type AppRoute = {
    path: string;
    page?: () => JSX.Element;
    icon?: JSX.Element;
    children?: AppRoute[];
};

export const mainRoutesInfo = {
    [routePath.home]: {
        title: 'Home',
    },
    [routePath.deeploys]: {
        title: 'Deeploys',
        description: 'View, organize & deeploy your apps',
    },
    [routePath.account]: {
        title: 'Account',
        description: 'Manage your account & billing settings',
    },
    [routePath.docs]: {
        title: 'Documentation',
        description: 'Access guides and resources',
    },
    [routePath.support]: {
        title: 'Support',
        description: 'Get help and contact support',
    },
};

// Routes with icons are displayed in the main navigation
export const routes: AppRoute[] = [
    {
        path: routePath.home,
        page: Home,
        icon: <RiHomeLine />,
    },
];
