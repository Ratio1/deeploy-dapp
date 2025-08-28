import { TunnelingSecrets } from '@typedefs/general';
import { Tunnel } from '@typedefs/tunnels';
import { createContext } from 'react';

export interface TunnelsContextType {
    openTunnelRenameModal: (tunnel: Tunnel, callback: () => any) => void;
    openTunnelCreateModal: (callback: () => any) => void;
    openTunnelTokenModal: (token: string, alias?: string) => void;
    openTunnelDNSModal: (hostname: string, url: string) => void;
    // Secrets
    tunnelingSecrets: TunnelingSecrets | undefined;
    setTunnelingSecrets: React.Dispatch<React.SetStateAction<TunnelingSecrets | undefined>>;
}

export const TunnelsContext = createContext<TunnelsContextType | null>(null);
