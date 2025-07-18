import { TunnelsContextType, useTunnelsContext } from '@lib/contexts/tunnels';
import { routePath } from '@lib/routes/route-paths';
import { BorderedCard } from '@shared/cards/BorderedCard';
import ContextMenuWithTrigger from '@shared/ContextMenuWithTrigger';
import { SmallTag } from '@shared/SmallTag';
import { Tunnel } from '@typedefs/tunnels';
import { RiExternalLinkLine, RiLinkM } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';

export default function TunnelCard({ tunnel }: { tunnel: Tunnel }) {
    const navigate = useNavigate();

    const { openTunnelRenameModal } = useTunnelsContext() as TunnelsContextType;

    return (
        <div onClick={() => navigate(`${routePath.tunnels}/${tunnel.id}`)}>
            <BorderedCard isHoverable>
                <div className="row justify-between gap-3 bg-white lg:gap-6">
                    <div className="col gap-1">
                        <div className="font-medium">{tunnel.alias}</div>

                        <Link
                            to={`https://${tunnel.url}`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="cursor-pointer transition-all hover:opacity-60"
                        >
                            <div className="row gap-1 text-primary">
                                <div className="font-robotoMono text-sm">{tunnel.url}</div>
                                <RiExternalLinkLine className="mb-[1px] text-[17px]" />
                            </div>
                        </Link>
                    </div>

                    <div className="row gap-3">
                        {tunnel.custom_hostnames.length > 0 && (
                            <SmallTag variant="green">
                                <div className="row gap-0.5">
                                    <RiLinkM className="text-lg" />
                                    <div className="text-sm font-medium">Linked</div>
                                </div>
                            </SmallTag>
                        )}

                        <ContextMenuWithTrigger
                            items={[
                                {
                                    key: 'rename',
                                    label: 'Rename',
                                    onPress: () => {
                                        openTunnelRenameModal(tunnel, (alias) => {
                                            console.log('alias', alias);
                                        });
                                    },
                                },
                                {
                                    key: 'viewToken',
                                    label: 'View Token',
                                    onPress: () => {},
                                },
                                {
                                    key: 'delete',
                                    label: 'Delete',
                                    onPress: () => {},
                                },
                            ]}
                        />
                    </div>
                </div>
            </BorderedCard>
        </div>
    );
}
