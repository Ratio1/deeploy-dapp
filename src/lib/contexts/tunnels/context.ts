import { Tunnel } from '@typedefs/tunnels';
import { createContext } from 'react';

export interface TunnelsContextType {
    openTunnelRenameModal: (tunnel: Tunnel, onRename: (alias: string) => void) => void;
}

export const TunnelsContext = createContext<TunnelsContextType | null>(null);
