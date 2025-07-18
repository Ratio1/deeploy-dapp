import TunnelAliasModal from '@components/tunnels/TunnelAliasModal';
import { Tunnel } from '@typedefs/tunnels';
import { useRef } from 'react';
import { TunnelsContext } from './context';

export const TunnelsProvider = ({ children }) => {
    const tunnelRenameModalRef = useRef<{ trigger: (callback: () => any, tunnel?: Tunnel) => void }>(null);
    const tunnelCreateModalRef = useRef<{ trigger: (callback: () => any, tunnel?: Tunnel) => void }>(null);

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

    return (
        <TunnelsContext.Provider
            value={{
                openTunnelRenameModal,
                openTunnelCreateModal,
            }}
        >
            {children}

            {/* Overlays */}
            <TunnelAliasModal ref={tunnelRenameModalRef} action="rename" />
            <TunnelAliasModal ref={tunnelCreateModalRef} action="create" />
        </TunnelsContext.Provider>
    );
};
