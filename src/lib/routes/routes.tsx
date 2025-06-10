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
    [routePath.root]: {
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
    [routePath.termsAndConditions]: {
        title: 'Terms & Conditions',
        description: 'Terms governing your use of our services',
    },
    [routePath.privacyPolicy]: {
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
        path: routePath.root,
        page: Home,
        icon: <RiHomeLine />,
    },
];
