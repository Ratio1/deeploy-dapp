import TunnelCard from '@components/tunnels/TunnelCard';
import { Alert } from '@heroui/alert';
import { Button } from '@heroui/button';
import { Skeleton } from '@heroui/skeleton';
import { addSecrets, getSecrets, getTunnels } from '@lib/api/tunnels';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { TunnelsContextType, useTunnelsContext } from '@lib/contexts/tunnels';
import { buildDeeployMessage } from '@lib/deeploy-utils';
import EmptyData from '@shared/EmptyData';
import { Tunnel } from '@typedefs/tunnels';
import { useEffect, useState } from 'react';
import { RiAddLine, RiDraftLine } from 'react-icons/ri';
import { useAccount, useSignMessage } from 'wagmi';

function Tunnels() {
    const { openTunnelCreateModal } = useTunnelsContext() as TunnelsContextType;
    const { signMessageAsync } = useSignMessage();
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();

    const [secretsLoaded, setSecretsLoaded] = useState(false);
    const [tunnels, setTunnels] = useState<Tunnel[]>([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    // Init
    useEffect(() => {
        const secretsLoaded = !!localStorage.getItem('tunnel_secrets');
        setSecretsLoaded(secretsLoaded);
        if (secretsLoaded) {
            fetchTunnels();
        } else {
            setTunnels([]);
        }
    }, [address]);

    const requestSecrets = async () => {
        const nonce = `0x${Date.now().toString(16)}`;
        const message = buildDeeployMessage(
            {
                nonce,
            },
            'Please sign this message to manage your tunnels: ',
        );

        const signature = await signMessageAsync({
            account: address,
            message,
        });

        const payload = {
            nonce,
            EE_ETH_SIGN: signature,
            EE_ETH_SENDER: address,
        };

        const secrets = await getSecrets(payload);

        localStorage.setItem('tunnel_secrets', JSON.stringify(secrets.result));

        setSecretsLoaded(true);
        fetchTunnels();
    };

    const addSecretsF = async () => {
        if (!address) {
            return;
        }

        const nonce = `0x${Date.now().toString(16)}`;
        const csp_address = '0x496d6e08b8d684795752867B274E94a26395EA59';
        const cloudflare_account_id = '84abdbe27b36ef8e3e73e3f2a2bbf556';
        const cloudflare_api_key = 'e68VwdFqHHuVslNk_VcwQll0c_-pMlcwD-xKYAsZ';
        const cloudflare_zone_id = 'cd309a9ea91258ac68709f04c67d4fbb';
        const cloudflare_domain = 'ratio1.link';

        const message = buildDeeployMessage({
            nonce,
            csp_address,
            cloudflare_account_id,
            cloudflare_api_key,
            cloudflare_zone_id,
            cloudflare_domain,
        });

        const signature = await signMessageAsync({
            account: address,
            message,
        });

        const payload = {
            nonce,
            EE_ETH_SIGN: signature,
            EE_ETH_SENDER: address,
            csp_address,
            cloudflare_account_id,
            cloudflare_api_key,
            cloudflare_zone_id,
            cloudflare_domain,
        };

        await addSecrets(payload);
    };

    const fetchTunnels = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getTunnels();
            const tunnelsObj = data.result || {};

            const tunnelsArray = Object.values(tunnelsObj)
                .filter((t: any) => t.metadata?.creator === 'ratio1')
                .map((t: any) => ({
                    id: t.id,
                    status: t.status,
                    connections: t.connections || [],
                    alias: t.metadata.alias,
                    url: t.metadata.dns_name,
                    token: t.metadata.tunnel_token,
                    custom_hostnames: t.metadata.custom_hostnames,
                }));

            console.log(tunnelsArray);

            setTunnels(tunnelsArray);
        } catch (e: any) {
            setError('An error occurred while fetching the tunnels.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex-1">
            {secretsLoaded ? (
                <div className="col mx-auto max-w-[620px] gap-8">
                    <div className="flex items-start justify-between">
                        <div className="text-2xl font-bold">Tunnels</div>

                        <Button color="primary" variant="solid" onPress={() => openTunnelCreateModal(() => fetchTunnels())}>
                            <div className="row gap-1">
                                <RiAddLine className="text-lg" />
                                <div className="compact">Add Tunnel</div>
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
                                            description="Create a tunnel to get started"
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
            ) : (
                <Button color="primary" variant="solid" onPress={() => requestSecrets()}>
                    <div className="row gap-1">
                        <div className="compact">Request Secrets</div>
                    </div>
                </Button>
            )}
        </div>
    );
}

export default Tunnels;
