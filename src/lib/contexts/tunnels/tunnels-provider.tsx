import TunnelRenameModal from '@components/tunnels/TunnelRenameModal';
import { Tunnel } from '@typedefs/tunnels';
import { useRef } from 'react';
import { TunnelsContext } from './context';

export const TunnelsProvider = ({ children }) => {
    const tunnelRenameModalRef = useRef<{ trigger: (_tunnel: Tunnel, onRename: () => any) => void }>(null);

    const openTunnelRenameModal = (tunnel: Tunnel, onRename: () => any) => {
        if (tunnelRenameModalRef.current) {
            tunnelRenameModalRef.current.trigger(tunnel, onRename);
        }
    };

    return (
        <TunnelsContext.Provider
            value={{
                openTunnelRenameModal,
            }}
        >
            {children}

            {/* Overlays */}
            <TunnelRenameModal ref={tunnelRenameModalRef} />
        </TunnelsContext.Provider>
    );
};
