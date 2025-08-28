import AddTunnelingSecrets from '@components/tunnels/AddTunnelingSecrets';
import TunnelCard from '@components/tunnels/TunnelCard';
import { Alert } from '@heroui/alert';
import { Button } from '@heroui/button';
import { Skeleton } from '@heroui/skeleton';
import { Spinner } from '@heroui/spinner';
import { checkSecrets, getSecrets, getTunnels } from '@lib/api/tunnels';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { TunnelsContextType, useTunnelsContext } from '@lib/contexts/tunnels';
import { buildDeeployMessage, generateNonce } from '@lib/deeploy-utils';
import { getSingleton, setSingleton } from '@lib/storage/db';
import { DetailedAlert } from '@shared/DetailedAlert';
import EmptyData from '@shared/EmptyData';
import { Tunnel } from '@typedefs/tunnels';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiAddLine, RiDoorLockLine, RiDraftLine, RiPencilLine } from 'react-icons/ri';
import { useAccount, useSignMessage } from 'wagmi';

enum SecretsState {
    NotStoredLocally = 'not_stored_locally', // Secrets exist on the server but not locally
    NotAdded = 'not_added', // Secrets don't exist on the server
    AddedAndStoredLocally = 'added_and_stored_locally', // Secrets exist on the server and locally
}

function Tunnels() {
    const { openTunnelCreateModal } = useTunnelsContext() as TunnelsContextType;
    const { signMessageAsync } = useSignMessage();
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();

    const [isLoading, setLoading] = useState(true); // The loading state of the whole page

    const [isFetchingSecrets, setFetchingSecrets] = useState(false);
    const [secretsState, setSecretsState] = useState<SecretsState | undefined>();

    const [tunnels, setTunnels] = useState<Tunnel[]>([]);
    const [isFetchingTunnels, setFetchingTunnels] = useState(true);

    const [error, setError] = useState<string | null>(null);

    // Init
    useEffect(() => {
        if (address) {
            init();
        }
    }, [address]);

    const init = async () => {
        if (!address) {
            return;
        }

        const tunnelingSecrets = await getSingleton('tunnelingSecrets');

        if (!tunnelingSecrets) {
            const { result } = await checkSecrets(address);

            if (result?.exists) {
                console.log('Secrets exist on the server but not locally');
                setSecretsState(SecretsState.NotStoredLocally);
            } else {
                console.log('Secrets do not exist on the server');
                setSecretsState(SecretsState.NotAdded);
            }
        } else {
            console.log('Tunneling secrets stored locally');
            setSecretsState(SecretsState.AddedAndStoredLocally);
            fetchTunnels();
        }

        setLoading(false);
    };

    const fetchSecrets = async () => {
        try {
            setFetchingSecrets(true);

            const nonce = generateNonce();
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

            const response = await getSecrets(payload);
            const secrets = response.result;

            if (secrets) {
                await setSingleton('tunnelingSecrets', {
                    cloudflareAccountId: secrets.cloudflare_account_id,
                    cloudflareApiKey: secrets.cloudflare_api_key,
                    cloudflareZoneId: secrets.cloudflare_zone_id,
                    cloudflareDomain: secrets.cloudflare_domain,
                });

                setSecretsState(SecretsState.AddedAndStoredLocally);
                setTimeout(() => fetchTunnels());
                toast.success('Secrets fetched successfully.');
            } else {
                setSecretsState(SecretsState.NotAdded);
            }
        } catch (error) {
            console.error(error);
            setError('An error occurred while fetching the secrets.');
        } finally {
            setFetchingSecrets(false);
        }
    };

    const fetchTunnels = async () => {
        setFetchingTunnels(true);
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

            setTunnels(tunnelsArray);
        } catch (e: any) {
            setError('An error occurred while fetching the tunnels.');
            console.error(e);
        } finally {
            setFetchingTunnels(false);
        }
    };

    if (isLoading || !secretsState) {
        return (
            <div className="center-all w-full flex-1">
                <Spinner />
            </div>
        );
    }

    if (secretsState === SecretsState.NotStoredLocally) {
        return (
            <div className="center-all w-full flex-1">
                <DetailedAlert
                    icon={<RiDoorLockLine />}
                    title="Secrets Required"
                    description={
                        <div className="col text-[15px]">
                            <div>Your Cloudflare secrets are not available locally.</div>
                            <div>
                                You need to <span className="text-primary font-medium">sign a message</span> in order to fetch
                                them.
                            </div>
                        </div>
                    }
                >
                    <Button color="primary" variant="solid" onPress={() => fetchSecrets()} isLoading={isFetchingSecrets}>
                        <div className="row gap-1.5">
                            <RiPencilLine className="text-lg" />
                            <div className="compact">Get Secrets</div>
                        </div>
                    </Button>
                </DetailedAlert>
            </div>
        );
    }

    if (secretsState === SecretsState.NotAdded) {
        return (
            <div className="center-all w-full flex-1">
                <DetailedAlert
                    variant="red"
                    icon={<RiDoorLockLine />}
                    title="Missing Secrets"
                    description={
                        <div className="col text-[15px]">
                            <div>Your Cloudflare secrets are not set.</div>
                            <div>Please obtain and add them using the form below.</div>
                        </div>
                    }
                    fullWidth
                >
                    <AddTunnelingSecrets
                        onSuccess={() => {
                            setSecretsState(SecretsState.AddedAndStoredLocally);
                            fetchTunnels();
                        }}
                    />
                </DetailedAlert>
            </div>
        );
    }

    return (
        <div className="w-full flex-1">
            <div className="col mx-auto max-w-[620px] gap-8">
                <div className="flex justify-end">
                    <Button color="primary" variant="solid" onPress={() => openTunnelCreateModal(() => fetchTunnels())}>
                        <div className="row gap-1">
                            <RiAddLine className="text-lg" />
                            <div className="compact">Add Tunnel</div>
                        </div>
                    </Button>
                </div>

                {error && !isFetchingTunnels && (
                    <Alert
                        color="danger"
                        title={error}
                        classNames={{
                            base: 'items-center',
                        }}
                    />
                )}

                <div className="col gap-4">
                    {isFetchingTunnels ? (
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
        </div>
    );
}

export default Tunnels;
