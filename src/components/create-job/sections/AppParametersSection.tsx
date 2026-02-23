import { Button } from '@heroui/button';
import { SelectItem } from '@heroui/select';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { getTunnels } from '@lib/api/tunnels';
import { TunnelsContextType, useTunnelsContext } from '@lib/contexts/tunnels';
import { routePath } from '@lib/routes/route-paths';
import InputWithLabel from '@shared/InputWithLabel';
import Label from '@shared/Label';
import DeeployInfoTag from '@shared/jobs/DeeployInfoTag';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';
import { SmallTag } from '@shared/SmallTag';
import StyledSelect from '@shared/StyledSelect';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { RiCodeSSlashLine, RiRefreshLine } from 'react-icons/ri';

type TunnelGenerationResult = {
    token?: string;
    url?: string;
};

type ExistingTunnelOption = {
    id: string;
    alias: string;
    token: string;
    url: string;
};

export default function AppParametersSection({
    baseName = 'deployment',
    isCreatingTunnel = false,
    enablePort = true,
    enableTunnelingLabel = false,
    forceTunnelingEnabled = false,
    disableTunneling = false,
    tunnelingDisabledNote,
    enableTunnelSelector = false,
    onGenerateTunnel,
    isTunnelGenerationDisabled = false,
    onTunnelUrlChange,
}: {
    baseName?: string;
    isCreatingTunnel?: boolean;
    enablePort?: boolean;
    enableTunnelingLabel?: boolean;
    forceTunnelingEnabled?: boolean;
    disableTunneling?: boolean;
    tunnelingDisabledNote?: string;
    enableTunnelSelector?: boolean;
    onGenerateTunnel?: () => Promise<TunnelGenerationResult | undefined>;
    isTunnelGenerationDisabled?: boolean;
    onTunnelUrlChange?: (url?: string) => void;
}) {
    const { watch, trigger, setValue, clearErrors, getValues } = useFormContext();
    const { tunnelingSecrets } = useTunnelsContext() as TunnelsContextType;

    const enableTunneling: (typeof BOOLEAN_TYPES)[number] = watch(`${baseName}.enableTunneling`);
    const tunnelingToken: string | undefined = watch(`${baseName}.tunnelingToken`);

    const [existingTunnels, setExistingTunnels] = useState<ExistingTunnelOption[]>([]);
    const [selectedTunnelId, setSelectedTunnelId] = useState<string | undefined>();
    const [isFetchingTunnels, setFetchingTunnels] = useState<boolean>(false);

    const shouldShowTunnelAlternatives = enableTunnelSelector && enableTunneling === BOOLEAN_TYPES[0];

    const fetchExistingTunnels = useCallback(async () => {
        if (!tunnelingSecrets) {
            setExistingTunnels([]);
            return;
        }

        setFetchingTunnels(true);

        try {
            const data = await getTunnels(tunnelingSecrets.cloudflareAccountId, tunnelingSecrets.cloudflareApiKey);
            const tunnelResults = Array.isArray(data.result) ? data.result : Object.values(data.result || {});

            const tunnels = (tunnelResults as any[])
                .filter((tunnel) => tunnel?.metadata?.creator === 'ratio1' && tunnel?.metadata?.tunnel_token)
                .map((tunnel) => ({
                    id: tunnel.id as string,
                    alias: (tunnel.metadata.alias || tunnel.metadata.dns_name) as string,
                    token: tunnel.metadata.tunnel_token as string,
                    url: tunnel.metadata.dns_name as string,
                }))
                .sort((a, b) => a.alias.localeCompare(b.alias));

            setExistingTunnels(tunnels);
        } catch (error) {
            console.error('Error fetching existing tunnels:', error);
            setExistingTunnels([]);
        } finally {
            setFetchingTunnels(false);
        }
    }, [tunnelingSecrets]);

    useEffect(() => {
        if (!shouldShowTunnelAlternatives || !tunnelingSecrets) {
            setExistingTunnels([]);
            setSelectedTunnelId(undefined);
            return;
        }

        void fetchExistingTunnels();
    }, [shouldShowTunnelAlternatives, tunnelingSecrets, fetchExistingTunnels]);

    useEffect(() => {
        if (!shouldShowTunnelAlternatives || !tunnelingToken || existingTunnels.length === 0) {
            setSelectedTunnelId(undefined);
            return;
        }

        const matchedTunnel = existingTunnels.find((tunnel) => tunnel.token === tunnelingToken);
        setSelectedTunnelId(matchedTunnel?.id);
    }, [shouldShowTunnelAlternatives, tunnelingToken, existingTunnels]);

    const selectExistingTunnel = (tunnelId: string) => {
        const selectedTunnel = existingTunnels.find((tunnel) => tunnel.id === tunnelId);

        if (!selectedTunnel) {
            return;
        }

        setSelectedTunnelId(selectedTunnel.id);
        setValue(`${baseName}.tunnelingToken`, selectedTunnel.token, { shouldDirty: true, shouldValidate: true });
        clearErrors(`${baseName}.tunnelingToken`);
        onTunnelUrlChange?.(selectedTunnel.url);
    };

    const handleGenerateTunnel = async () => {
        if (!onGenerateTunnel) {
            return;
        }

        const generatedTunnel = await onGenerateTunnel();

        if (!generatedTunnel?.token) {
            return;
        }

        setSelectedTunnelId(undefined);
        setValue(`${baseName}.tunnelingToken`, generatedTunnel.token, { shouldDirty: true, shouldValidate: true });
        clearErrors(`${baseName}.tunnelingToken`);
        onTunnelUrlChange?.(generatedTunnel.url);

        if (tunnelingSecrets) {
            await fetchExistingTunnels();
        }
    };

    return (
        <div className="col gap-4">
            {(!forceTunnelingEnabled || enablePort) && (
                <div className="col gap-2">
                    <div className="flex gap-4">
                        {!forceTunnelingEnabled && (
                            <SelectWithLabel
                                name={`${baseName}.enableTunneling`}
                                label="Enable Tunneling"
                                options={BOOLEAN_TYPES}
                                isDisabled={disableTunneling}
                                onSelect={(value) => {
                                    trigger(`${baseName}.port`);

                                    if (value === BOOLEAN_TYPES[1]) {
                                        setValue(`${baseName}.tunnelingToken`, undefined);
                                        clearErrors(`${baseName}.tunnelingToken`);
                                    }
                                }}
                            />
                        )}

                        {enablePort && (
                            <NumberInputWithLabel
                                name={`${baseName}.port`}
                                label="Port"
                                isOptional={enableTunneling === BOOLEAN_TYPES[1]}
                            />
                        )}
                    </div>

                    {disableTunneling && tunnelingDisabledNote && (
                        <DeeployInfoTag text={tunnelingDisabledNote} />
                    )}
                </div>
            )}

            {enableTunneling === BOOLEAN_TYPES[0] && (
                <div className="col gap-4">
                    {shouldShowTunnelAlternatives && (
                        <div className="col gap-3 rounded-lg border border-slate-200 bg-light p-3">
                            <div className="row items-center gap-2">
                                <div className="font-medium">Tunnel Setup</div>
                                <SmallTag variant="blue">3 Options</SmallTag>
                            </div>

                            {!tunnelingSecrets && (
                                <DeeployInfoTag
                                    text={
                                        <>
                                            Please add your{' '}
                                            <Link href={routePath.tunnels} className="text-primary font-medium hover:opacity-70">
                                                Cloudflare secrets
                                            </Link>{' '}
                                            to generate or select tunnels.
                                        </>
                                    }
                                />
                            )}

                            <div className="col gap-2">
                                <div className="row flex-wrap items-center gap-2">
                                    <Label value="1. Generate New Tunnel" />
                                    <SmallTag variant="slate">Default</SmallTag>
                                </div>

                                <Button
                                    className="max-w-max"
                                    color="primary"
                                    size="sm"
                                    onPress={handleGenerateTunnel}
                                    isLoading={isCreatingTunnel}
                                    isDisabled={isTunnelGenerationDisabled || !tunnelingSecrets}
                                >
                                    <div className="row gap-1.5">
                                        <RiCodeSSlashLine className="text-base" />
                                        <div className="compact">Generate Tunnel</div>
                                    </div>
                                </Button>
                            </div>

                            <div className="col gap-2">
                                <div className="row flex-wrap items-center justify-between gap-2">
                                    <Label value="2. Select Existing Tunnel" />

                                    <Button
                                        className="h-[30px] min-w-[30px] px-2 text-slate-500"
                                        color="default"
                                        variant="light"
                                        onPress={() => fetchExistingTunnels()}
                                        isDisabled={!tunnelingSecrets || isFetchingTunnels}
                                        isIconOnly
                                    >
                                        <RiRefreshLine className={isFetchingTunnels ? 'animate-spin' : ''} />
                                    </Button>
                                </div>

                                <StyledSelect
                                    selectedKeys={selectedTunnelId ? [selectedTunnelId] : []}
                                    onSelectionChange={(keys) => {
                                        const selectedKey = Array.from(keys)[0] as string;
                                        selectExistingTunnel(selectedKey);
                                    }}
                                    placeholder={
                                        !tunnelingSecrets
                                            ? 'Cloudflare secrets required'
                                            : isFetchingTunnels
                                              ? 'Loading tunnels...'
                                              : existingTunnels.length === 0
                                                ? 'No existing tunnels found'
                                                : 'Select an existing tunnel'
                                    }
                                    isDisabled={!tunnelingSecrets || isFetchingTunnels || existingTunnels.length === 0}
                                >
                                    {existingTunnels.map((tunnel) => (
                                        <SelectItem
                                            key={tunnel.id}
                                            textValue={`${tunnel.alias} | ${tunnel.url}`}
                                            className="h-[52px]"
                                        >
                                            <div className="col py-0.5">
                                                <div className="font-medium">{tunnel.alias}</div>
                                                <div className="font-roboto-mono text-xs text-slate-500">{tunnel.url}</div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </StyledSelect>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <InputWithLabel
                            name={`${baseName}.tunnelingToken`}
                            label={shouldShowTunnelAlternatives ? '3. Tunnel Token (Manual)' : 'Tunnel Token'}
                            placeholder="Starts with 'ey'"
                            isDisabled={isCreatingTunnel}
                            onBlur={() => {
                                const selectedTunnel = existingTunnels.find((tunnel) => tunnel.id === selectedTunnelId);

                                if (!selectedTunnel) {
                                    return;
                                }

                                const currentToken = getValues(`${baseName}.tunnelingToken`);

                                if (currentToken !== selectedTunnel.token) {
                                    setSelectedTunnelId(undefined);
                                    onTunnelUrlChange?.(undefined);
                                }
                            }}
                        />

                        {enableTunnelingLabel && (
                            <InputWithLabel
                                name={`${baseName}.tunnelingLabel`}
                                label="Tunnel Label"
                                placeholder="My_Tunnel"
                                isOptional
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
