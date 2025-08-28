import TunnelCard from '@components/tunnels/TunnelCard';
import TunnelingSecretsForm from '@components/tunnels/TunnelingSecretsForm';
import { Button } from '@heroui/button';
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@heroui/modal';
import { Skeleton } from '@heroui/skeleton';
import { Spinner } from '@heroui/spinner';
import { checkSecrets, getSecrets, getTunnels } from '@lib/api/tunnels';
import { getDevAddress, isUsingDevAddress } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { TunnelsContextType, useTunnelsContext } from '@lib/contexts/tunnels';
import { buildDeeployMessage, generateNonce } from '@lib/deeploy-utils';
import ActionButton from '@shared/ActionButton';
import { DetailedAlert } from '@shared/DetailedAlert';
import EmptyData from '@shared/EmptyData';
import { TunnelingSecrets } from '@typedefs/general';
import { Tunnel } from '@typedefs/tunnels';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiAddLine, RiDoorLockLine, RiDraftLine, RiErrorWarningLine, RiPencilLine } from 'react-icons/ri';
import { useAccount, useSignMessage } from 'wagmi';

function Tunnels() {
    const { tunnelingSecrets, setTunnelingSecrets } = useAuthenticationContext() as AuthenticationContextType;

    const { openTunnelCreateModal } = useTunnelsContext() as TunnelsContextType;
    const { signMessageAsync } = useSignMessage();
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();

    const [isLoading, setLoading] = useState(true); // The loading state of the whole page

    const [isFetchingSecrets, setFetchingSecrets] = useState(false);
    const [doSecretsExist, setSecretsExist] = useState<boolean | undefined>();

    const [tunnels, setTunnels] = useState<Tunnel[]>([]);
    const [isFetchingTunnels, setFetchingTunnels] = useState(true);

    const [error, setError] = useState<string | null>(null);

    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

    // Init
    useEffect(() => {
        if (address) {
            init();
        }
    }, [address]);

    useEffect(() => {
        if (tunnelingSecrets) {
            console.log('Tunneling secrets exist, fetching tunnels...');
            fetchTunnels();
        }
    }, [tunnelingSecrets]);

    const init = async () => {
        if (!address) {
            return;
        }

        if (!tunnelingSecrets) {
            const { result } = await checkSecrets(address);
            setSecretsExist(!!result?.exists);
        } else {
            setSecretsExist(true);
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
                setTunnelingSecrets({
                    cloudflareAccountId: secrets.cloudflare_account_id,
                    cloudflareApiKey: secrets.cloudflare_api_key,
                    cloudflareZoneId: secrets.cloudflare_zone_id,
                    cloudflareDomain: secrets.cloudflare_domain,
                });

                setSecretsExist(true);
                toast.success('Secrets fetched successfully.');
            } else {
                throw new Error('No secrets available on the server.');
            }
        } catch (error) {
            console.error(error);
            setError('An error occurred while fetching your secrets.');
        } finally {
            setFetchingSecrets(false);
        }
    };

    const fetchTunnels = async () => {
        if (!tunnelingSecrets) {
            console.error('No tunneling secrets available, skipping tunnels fetch');
            return;
        }

        setFetchingTunnels(true);
        setError(null);

        try {
            const data = await getTunnels(tunnelingSecrets.cloudflareAccountId, tunnelingSecrets.cloudflareApiKey);
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
            setError('An error occurred while fetching your tunnels.');
            console.error(e);
        } finally {
            setFetchingTunnels(false);
        }
    };

    if (isLoading || doSecretsExist === undefined) {
        return (
            <div className="center-all w-full flex-1">
                <Spinner />
            </div>
        );
    }

    // If secrets exist on the server but are not stored locally
    if (doSecretsExist && !tunnelingSecrets) {
        return (
            <div className="center-all w-full flex-1">
                <DetailedAlert
                    icon={<RiDoorLockLine />}
                    title="Secrets Required"
                    description={
                        <div className="text-[15px]">
                            Please <span className="text-primary font-medium">sign a message</span> in order to fetch your
                            Cloudflare secrets.
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

    if (!doSecretsExist) {
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
                    <TunnelingSecretsForm
                        onSuccess={(secrets: TunnelingSecrets) => {
                            setSecretsExist(true);
                            setTunnelingSecrets(secrets);
                        }}
                        wrapInCard
                    />
                </DetailedAlert>
            </div>
        );
    }

    return (
        <>
            <div className="w-full flex-1">
                <div className="col mx-auto max-w-[620px] gap-8">
                    <div className="row justify-between">
                        <ActionButton color="primary" onPress={() => openTunnelCreateModal(() => fetchTunnels())}>
                            <div className="row gap-1">
                                <RiAddLine className="text-lg" />
                                <div className="compact">Add Tunnel</div>
                            </div>
                        </ActionButton>

                        <ActionButton className="slate-button" color="default" onPress={onOpen}>
                            <div className="row gap-1.5">
                                <RiDoorLockLine className="text-lg" />
                                <div className="compact">Modify Secrets</div>
                            </div>
                        </ActionButton>
                    </div>

                    {error && !isFetchingTunnels && (
                        <div className="row gap-1.5 rounded-lg bg-red-100 p-4 text-red-700">
                            <RiErrorWarningLine className="text-xl" />
                            <div className="text-sm font-medium">{error}</div>
                        </div>
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

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="sm"
                shouldBlockScroll={false}
                classNames={{
                    closeButton: 'cursor-pointer',
                }}
            >
                <ModalContent>
                    <ModalHeader>Modify Secrets</ModalHeader>

                    <ModalBody className="pb-5">
                        <TunnelingSecretsForm
                            onSuccess={(secrets: TunnelingSecrets) => {
                                toast.success('Secrets updated successfully.');
                                setTunnelingSecrets(secrets);
                                onClose();
                            }}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}

export default Tunnels;
