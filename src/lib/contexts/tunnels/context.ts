import { Tunnel } from '@typedefs/tunnels';
import { createContext } from 'react';

export interface TunnelsContextType {
    openTunnelRenameModal: (tunnel: Tunnel, callback: () => any) => void;
    openTunnelCreateModal: (callback: () => any) => void;
}

export const TunnelsContext = createContext<TunnelsContextType | null>(null);
