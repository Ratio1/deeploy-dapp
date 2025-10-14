import { RiBox3Line, RiEdit2Line, RiWalletLine } from 'react-icons/ri';

export const DEEPLOY_FLOW_ACTIONS = {
    payment: {
        icon: <RiWalletLine />,
        title: 'Confirm payment',
    },
    signXMessages: {
        icon: <RiEdit2Line />,
        title: 'Sign required messages',
    },
    callDeeployApi: {
        icon: <RiBox3Line />,
        title: 'Wait for deployment',
    },
} as const;

export type DEEPLOY_FLOW_ACTION_KEYS = keyof typeof DEEPLOY_FLOW_ACTIONS | 'done';
