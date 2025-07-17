import { Skeleton } from '@heroui/skeleton';
import { getTunnel } from '@lib/api/tunnels';
import { routePath } from '@lib/routes/route-paths';
import ActionButton from '@shared/ActionButton';
import { CompactCustomCard } from '@shared/cards/CompactCustomCard';
import EmptyData from '@shared/EmptyData';
import StyledInput from '@shared/StyledInput';
import { Tunnel } from '@typedefs/tunnels';
import { useEffect, useState } from 'react';
import { RiArrowLeftLine, RiDeleteBin2Line, RiDraftLine, RiEdit2Line, RiExternalLinkLine, RiLinkM } from 'react-icons/ri';
import { Link, useNavigate, useParams } from 'react-router-dom';

export default function TunnelPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [tunnel, setTunnel] = useState<Tunnel | undefined>();

    useEffect(() => {
        init(id);
    }, [id]);

    useEffect(() => {
        if (tunnel) {
            console.log(tunnel);
        }
    }, [tunnel]);

    const init = async (id: string | undefined) => {
        try {
            if (!id) {
                throw new Error('Invalid tunnel ID.');
            }

            const { result: tunnel } = await getTunnel(id);
            setTunnel({
                id: tunnel.id,
                alias: tunnel.alias,
                url: tunnel.dns_name,
                token: tunnel.tunnel_token,
                custom_hostnames: tunnel.custom_hostnames,
            });
        } catch (error) {
            console.error(error);
            navigate(routePath.notFound);
        }
    };

    if (!tunnel) {
        return (
            <div className="col mx-auto w-full max-w-2xl gap-6">
                <div className="row justify-between gap-8">
                    {Array.from({ length: 2 }).map((_, index) => (
                        <Skeleton key={index} className="min-h-8 w-64 rounded-lg" />
                    ))}
                </div>

                <Skeleton className="min-h-[38px] w-full rounded-lg" />
                <Skeleton className="min-h-[150px] w-full rounded-lg" />
            </div>
        );
    }

    return (
        <div className="w-full flex-1">
            <div className="col mx-auto max-w-2xl gap-6">
                <div className="row gap-2.5">
                    <Link to={routePath.tunnels} className="hover:opacity-50">
                        <div className="bg-slate-150 rounded-full p-1">
                            <RiArrowLeftLine className="text-xl" />
                        </div>
                    </Link>

                    <div className="text-2xl font-bold">{tunnel.alias}</div>
                </div>

                <div className="row justify-between">
                    <Link
                        to={`https://${tunnel.url}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-pointer transition-all hover:opacity-60"
                    >
                        <div className="row gap-1 text-primary">
                            <div className="font-robotoMono text-[15px]">{tunnel.url}</div>
                            <RiExternalLinkLine className="mb-[1px] text-[17px]" />
                        </div>
                    </Link>

                    <div className="row gap-2">
                        <ActionButton className="slate-button" color="default" onPress={() => {}}>
                            <div className="row gap-1.5">
                                <RiEdit2Line className="text-lg" />
                                <div className="text-sm font-medium">Rename</div>
                            </div>
                        </ActionButton>

                        <ActionButton className="slate-button" color="default" onPress={() => {}}>
                            <div className="text-sm font-medium">View Token</div>
                        </ActionButton>

                        <ActionButton className="bg-red-500" color="danger" onPress={() => {}}>
                            <div className="row gap-1.5">
                                <RiDeleteBin2Line className="text-lg" />
                                <div className="text-sm">Delete</div>
                            </div>
                        </ActionButton>
                    </div>
                </div>

                <CompactCustomCard
                    header={
                        <div className="row gap-1.5">
                            <RiLinkM className="text-lg text-primary-500" />
                            <div className="text-sm font-medium">Linked Domains</div>
                        </div>
                    }
                    footer={
                        <div className="row justify-between gap-2">
                            <StyledInput placeholder="mydomain.com" />

                            <div className="flex">
                                <ActionButton
                                    color="primary"
                                    variant="solid"
                                    onPress={() => {
                                        console.log('Add');
                                    }}
                                >
                                    <div className="text-sm">Add Domain</div>
                                </ActionButton>
                            </div>
                        </div>
                    }
                >
                    {tunnel.custom_hostnames.length > 0 ? (
                        <>
                            {tunnel.custom_hostnames.map((h) => (
                                <div key={h.id} className="p-4 text-sm font-medium">
                                    {h.hostname}
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="center-all">
                            <EmptyData
                                title="No linked domains"
                                description="Link a domain to the tunnel."
                                icon={<RiDraftLine />}
                            />
                        </div>
                    )}
                </CompactCustomCard>
            </div>
        </div>
    );
}
