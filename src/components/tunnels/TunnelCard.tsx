import { deleteTunnel } from '@lib/api/tunnels';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { TunnelsContextType, useTunnelsContext } from '@lib/contexts/tunnels';
import { routePath } from '@lib/routes/route-paths';
import { BorderedCard } from '@shared/cards/BorderedCard';
import ContextMenuWithTrigger from '@shared/ContextMenuWithTrigger';
import { CopyableValue } from '@shared/CopyableValue';
import { SmallTag } from '@shared/SmallTag';
import { Tunnel } from '@typedefs/tunnels';
import toast from 'react-hot-toast';
import { RiExternalLinkLine, RiLinkM } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';

export default function TunnelCard({ tunnel, fetchTunnels }: { tunnel: Tunnel; fetchTunnels: () => Promise<void> }) {
    const { openTunnelRenameModal, openTunnelTokenModal } = useTunnelsContext() as TunnelsContextType;
    const confirm = useInteractionContext() as InteractionContextType;

    const navigate = useNavigate();

    const onDeleteTunnel = async () => {
        try {
            await confirm(
                <div className="col gap-3">
                    <div>Are you sure you want to delete the following tunnel?</div>
                    <div className="font-medium">{tunnel.alias}</div>
                </div>,
                {
                    onConfirm: async () => {
                        await deleteTunnel(tunnel.id);
                        fetchTunnels();
                        toast.success('Tunnel deleted successfully.');
                    },
                },
            );
        } catch (error) {
            console.error('Error deleting tunnel:', error);
            toast.error('Failed to delete tunnel.');
        }
    };

    return (
        <div onClick={() => navigate(`${routePath.tunnels}/${tunnel.id}`)}>
            <BorderedCard isHoverable>
                <div className="row justify-between gap-3 bg-white lg:gap-6">
                    <SmallTag variant="green">
                        <div className="row gap-0.5">
                            <div className="compact">{tunnel.status}</div>
                        </div>
                    </SmallTag>

                    <div className="col gap-1">
                        <div className="font-medium">{tunnel.alias}</div>

                        <CopyableValue value={tunnel.url}>
                            <Link
                                to={`https://${tunnel.url}`}
                                target="_blank"
                                onClick={(e) => e.stopPropagation()}
                                className="cursor-pointer transition-all hover:opacity-60"
                            >
                                <div className="row text-primary gap-1">
                                    <div className="font-roboto-mono text-sm">{tunnel.url}</div>
                                    <RiExternalLinkLine className="mb-px text-[17px]" />
                                </div>
                            </Link>
                        </CopyableValue>
                    </div>

                    <div className="row gap-3">
                        {tunnel.custom_hostnames.length > 0 && (
                            <SmallTag>
                                <div className="row gap-0.5">
                                    <RiLinkM className="text-lg" />
                                    <div className="compact">
                                        {tunnel.custom_hostnames.length}{' '}
                                        {tunnel.custom_hostnames.length === 1 ? 'Domain' : 'Domains'}
                                    </div>
                                </div>
                            </SmallTag>
                        )}

                        <ContextMenuWithTrigger
                            items={[
                                {
                                    key: 'rename',
                                    label: 'Rename',
                                    onPress: () => {
                                        openTunnelRenameModal(tunnel, () => fetchTunnels());
                                    },
                                },
                                {
                                    key: 'viewToken',
                                    label: 'View Token',
                                    onPress: () => {
                                        openTunnelTokenModal(tunnel.token as string, tunnel.alias);
                                    },
                                },
                                {
                                    key: 'delete',
                                    label: 'Delete',
                                    onPress: onDeleteTunnel,
                                },
                            ]}
                        />
                    </div>
                </div>
            </BorderedCard>
        </div>
    );
}
