import TunnelCard from '@components/tunnels/TunnelCard';
import { Alert } from '@heroui/alert';
import { Button } from '@heroui/button';
import { Skeleton } from '@heroui/skeleton';
import { getTunnels } from '@lib/api/tunnels';
import { TunnelsContextType, useTunnelsContext } from '@lib/contexts/tunnels';
import EmptyData from '@shared/EmptyData';
import { Tunnel } from '@typedefs/tunnels';
import { useEffect, useState } from 'react';
import { RiAddLine, RiDraftLine } from 'react-icons/ri';

function Tunnels() {
    const { openTunnelCreateModal } = useTunnelsContext() as TunnelsContextType;

    const [tunnels, setTunnels] = useState<Tunnel[]>([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    // Init
    useEffect(() => {
        fetchTunnels();
    }, []);

    const fetchTunnels = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getTunnels();
            const tunnelsObj = data.result || {};

            const tunnelsArray = Object.values(tunnelsObj)
                .filter(Boolean)
                .map((t: any) => ({
                    id: t.id,
                    alias: t.alias,
                    url: t.dns_name,
                    token: t.tunnel_token,
                    custom_hostnames: t.custom_hostnames,
                }));

            console.log(tunnelsArray);

            setTunnels(tunnelsArray);
        } catch (e: any) {
            setError('An error occurred while fetching the tunnels.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex-1">
            <div className="col mx-auto max-w-[620px] gap-8">
                <div className="flex items-start justify-between">
                    <div className="text-2xl font-bold">Tunnels</div>

                    <Button color="primary" variant="solid" onPress={() => openTunnelCreateModal(() => fetchTunnels())}>
                        <div className="row gap-1">
                            <RiAddLine className="text-lg" />
                            <div className="text-sm font-medium">Add Tunnel</div>
                        </div>
                    </Button>
                </div>

                {error && !loading && (
                    <Alert
                        color="danger"
                        title={error}
                        classNames={{
                            base: 'items-center',
                        }}
                    />
                )}

                <div className="col gap-4">
                    {loading ? (
                        <>
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="min-h-[104px] w-full rounded-lg" />
                            ))}
                        </>
                    ) : (
                        <>
                            {tunnels.length === 0 && !error && (
                                <div className="center-all">
                                    <EmptyData
                                        title="No tunnels added"
                                        description="Create a tunnel to get started."
                                        icon={<RiDraftLine />}
                                    />
                                </div>
                            )}

                            {tunnels.map((tunnel) => (
                                <div key={tunnel.id}>
                                    <TunnelCard tunnel={tunnel} fetchTunnels={fetchTunnels} />
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Tunnels;
