import { RiBox3Line, RiDatabase2Line, RiTerminalBoxLine } from 'react-icons/ri';
import { JobType } from './deeploys';

export type JobTypeOption = {
    id: string;
    title: string;
    icon: React.ReactNode;
    textColorClass: string;
    color: 'blue' | 'green' | 'purple';
    jobType: JobType;
};

export const JOB_TYPE_OPTIONS: JobTypeOption[] = [
    {
        id: 'generic',
        title: 'Generic App',
        icon: <RiBox3Line />,
        textColorClass: 'text-primary-500',
        color: 'blue',
        jobType: JobType.Generic,
    },
    {
        id: 'native',
        title: 'Native App',
        icon: <RiTerminalBoxLine />,
        textColorClass: 'text-green-600',
        color: 'green',
        jobType: JobType.Native,
    },
    {
        id: 'service',
        title: 'Service',
        icon: <RiDatabase2Line />,
        textColorClass: 'text-purple-500',
        color: 'purple',
        jobType: JobType.Service,
    },
];
