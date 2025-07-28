import { RiBox3Line, RiDatabase2Line, RiTerminalBoxLine } from 'react-icons/ri';
import { JobType } from './deeploys';

export type JobTypeOption = {
    id: string;
    title: string;
    icon: React.ReactNode;
    color: string;
    jobType: JobType;
};

export const jobTypeOptions: JobTypeOption[] = [
    {
        id: 'generic',
        title: 'Generic App',
        icon: <RiBox3Line />,
        color: 'text-primary-500',
        jobType: JobType.Generic,
    },
    {
        id: 'native',
        title: 'Native App',
        icon: <RiTerminalBoxLine />,
        color: 'text-green-600',
        jobType: JobType.Native,
    },
    {
        id: 'service',
        title: 'Service',
        icon: <RiDatabase2Line />,
        color: 'text-purple-500',
        jobType: JobType.Service,
    },
];
