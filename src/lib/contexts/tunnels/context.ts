import { Tunnel } from '@typedefs/tunnels';
import { createContext } from 'react';

export interface TunnelsContextType {
    openTunnelRenameModal: (tunnel: Tunnel, onRename: () => any) => void;
}

export const TunnelsContext = createContext<TunnelsContextType | null>(null);
