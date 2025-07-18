import TunnelAliasModal from '@components/tunnels/TunnelAliasModal';
import TunnelTokenModal from '@components/tunnels/TunnelTokenModal';
import { Tunnel } from '@typedefs/tunnels';
import { useRef } from 'react';
import { TunnelsContext } from './context';

export const TunnelsProvider = ({ children }) => {
    const tunnelRenameModalRef = useRef<{ trigger: (callback: () => any, tunnel?: Tunnel) => void }>(null);
    const tunnelCreateModalRef = useRef<{ trigger: (callback: () => any, tunnel?: Tunnel) => void }>(null);
    const tunnelTokenModalRef = useRef<{ trigger: (token: string, alias?: string) => void }>(null);

    const openTunnelRenameModal = (tunnel: Tunnel, callback: () => any) => {
        if (tunnelRenameModalRef.current) {
            tunnelRenameModalRef.current.trigger(callback, tunnel);
        }
    };

    const openTunnelCreateModal = (callback: () => any) => {
        if (tunnelCreateModalRef.current) {
            tunnelCreateModalRef.current.trigger(callback);
        }
    };

    const openTunnelTokenModal = (token: string, alias?: string) => {
        if (tunnelTokenModalRef.current) {
            tunnelTokenModalRef.current.trigger(token, alias);
        }
    };

    return (
        <TunnelsContext.Provider
            value={{
                openTunnelRenameModal,
                openTunnelCreateModal,
                openTunnelTokenModal,
            }}
        >
            {children}

            {/* Overlays */}
            <TunnelAliasModal ref={tunnelRenameModalRef} action="rename" />
            <TunnelAliasModal ref={tunnelCreateModalRef} action="create" />
            <TunnelTokenModal ref={tunnelTokenModalRef} />
        </TunnelsContext.Provider>
    );
};
