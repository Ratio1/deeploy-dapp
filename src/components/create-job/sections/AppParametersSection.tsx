'use client';

import { Button } from '@heroui/button';
import { SelectItem } from '@heroui/select';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { getTunnels } from '@lib/api/tunnels';
import { TunnelsContextType, useTunnelsContext } from '@lib/contexts/tunnels';
import InputWithLabel from '@shared/InputWithLabel';
import Label from '@shared/Label';
import DeeployInfoTag from '@shared/jobs/DeeployInfoTag';
import NumberInputWithLabel from '@shared/NumberInputWithLabel';
import SelectWithLabel from '@shared/SelectWithLabel';
import StyledSelect from '@shared/StyledSelect';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { RiCodeSSlashLine } from 'react-icons/ri';

type TunnelGenerationResult = {
    token?: string;
    url?: string;
};

type TunnelStatus = 'inactive' | 'degraded' | 'healthy' | 'down';

type ExistingTunnelOption = {
    id: string;
    alias: string;
    token: string;
    url: string;
    status: TunnelStatus;
    isCustom?: false;
};

type CustomTunnelOption = {
    id: string;
    alias: string;
    token: string;
    url: string;
    isCustom: true;
};

type TunnelSelectOption = ExistingTunnelOption | CustomTunnelOption;

const CUSTOM_TUNNEL_OPTION = 'custom';

const tunnelStatusPriority: Record<TunnelStatus, number> = {
    healthy: 0,
    degraded: 1,
    inactive: 2,
    down: 3,
};

const tunnelStatusColorClassName: Record<TunnelStatus, string> = {
    healthy: 'bg-emerald-500',
    degraded: 'bg-yellow-500',
    inactive: 'bg-slate-500',
    down: 'bg-red-500',
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
    const { watch, trigger, setValue, clearErrors } = useFormContext();
    const { tunnelingSecrets } = useTunnelsContext() as TunnelsContextType;

    const enableTunneling: (typeof BOOLEAN_TYPES)[number] = watch(`${baseName}.enableTunneling`);
    const tunnelingToken: string | undefined = watch(`${baseName}.tunnelingToken`);

    const [existingTunnels, setExistingTunnels] = useState<ExistingTunnelOption[]>([]);
    const [selectedTunnelId, setSelectedTunnelId] = useState<string>(CUSTOM_TUNNEL_OPTION);
    const [isFetchingTunnels, setFetchingTunnels] = useState<boolean>(false);
    const tunnelSelectOptions = useMemo<TunnelSelectOption[]>(
        () => [
            {
                id: CUSTOM_TUNNEL_OPTION,
                alias: 'Custom',
                token: '',
                url: 'Enter token manually',
                isCustom: true,
            },
            ...existingTunnels,
        ],
        [existingTunnels],
    );

    const shouldShowTunnelAlternatives = enableTunnelSelector && enableTunneling === BOOLEAN_TYPES[0];

    const fetchExistingTunnels = useCallback(async (): Promise<ExistingTunnelOption[]> => {
        if (!tunnelingSecrets) {
            setExistingTunnels([]);
            return [];
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
                    status: tunnel.status as TunnelStatus,
                }))
                .sort((a, b) => {
                    const statusPriorityDiff = tunnelStatusPriority[a.status] - tunnelStatusPriority[b.status];

                    if (statusPriorityDiff !== 0) {
                        return statusPriorityDiff;
                    }

                    return a.alias.localeCompare(b.alias);
                });

            setExistingTunnels(tunnels);
            return tunnels;
        } catch (error) {
            console.error('Error fetching existing tunnels:', error);
            setExistingTunnels([]);
            return [];
        } finally {
            setFetchingTunnels(false);
        }
    }, [tunnelingSecrets]);

    useEffect(() => {
        if (!shouldShowTunnelAlternatives) {
            setExistingTunnels([]);
            setSelectedTunnelId(CUSTOM_TUNNEL_OPTION);
            return;
        }

        if (!tunnelingSecrets) {
            setExistingTunnels([]);
            setSelectedTunnelId(CUSTOM_TUNNEL_OPTION);
            return;
        }

        void fetchExistingTunnels();
    }, [shouldShowTunnelAlternatives, tunnelingSecrets, fetchExistingTunnels]);

    useEffect(() => {
        if (!shouldShowTunnelAlternatives) {
            return;
        }

        if (!tunnelingToken) {
            setSelectedTunnelId(CUSTOM_TUNNEL_OPTION);
            return;
        }

        const matchedTunnel = existingTunnels.find((tunnel) => tunnel.token === tunnelingToken);
        setSelectedTunnelId(matchedTunnel?.id || CUSTOM_TUNNEL_OPTION);
    }, [shouldShowTunnelAlternatives, tunnelingToken, existingTunnels]);

    const selectExistingTunnel = (tunnelId: string) => {
        if (tunnelId === CUSTOM_TUNNEL_OPTION) {
            setSelectedTunnelId(CUSTOM_TUNNEL_OPTION);
            setValue(`${baseName}.tunnelingToken`, undefined, { shouldDirty: true, shouldValidate: true });
            clearErrors(`${baseName}.tunnelingToken`);
            onTunnelUrlChange?.(undefined);
            return;
        }

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

        setValue(`${baseName}.tunnelingToken`, generatedTunnel.token, { shouldDirty: true, shouldValidate: true });
        clearErrors(`${baseName}.tunnelingToken`);

        const refreshedTunnels = tunnelingSecrets ? await fetchExistingTunnels() : existingTunnels;
        const matchedTunnel = refreshedTunnels.find((tunnel) => tunnel.token === generatedTunnel.token);

        setSelectedTunnelId(matchedTunnel?.id || CUSTOM_TUNNEL_OPTION);
        onTunnelUrlChange?.(matchedTunnel?.url || generatedTunnel.url);
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
                                        setSelectedTunnelId(CUSTOM_TUNNEL_OPTION);
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

                    {disableTunneling && tunnelingDisabledNote && <DeeployInfoTag text={tunnelingDisabledNote} />}
                </div>
            )}

            {enableTunneling === BOOLEAN_TYPES[0] && (
                <div className="col gap-4">
                    {shouldShowTunnelAlternatives && (
                        <div className="col w-full gap-1.5">
                            <Label value="Select Tunnel" />

                            <div className="row items-end gap-2">
                                <StyledSelect
                                    items={tunnelSelectOptions}
                                    selectedKeys={[selectedTunnelId]}
                                    onSelectionChange={(keys) => {
                                        const selectedKey = Array.from(keys)[0] as string;
                                        selectExistingTunnel(selectedKey);
                                    }}
                                    placeholder={isFetchingTunnels ? 'Loading tunnels...' : 'Select an existing tunnel'}
                                    isDisabled={isFetchingTunnels}
                                    renderValue={(items) => {
                                        return items.map((item) => {
                                            const tunnel = item.data as TunnelSelectOption | undefined;

                                            if (!tunnel) {
                                                return <div key={item.key}>{item.textValue}</div>;
                                            }

                                            return <TunnelSelectOptionContent key={item.key} tunnel={tunnel} />;
                                        });
                                    }}
                                >
                                    {(option: object) => {
                                        const tunnel = option as TunnelSelectOption;

                                        return (
                                            <SelectItem
                                                key={tunnel.id}
                                                textValue={tunnel.isCustom ? tunnel.alias : `${tunnel.alias} | ${tunnel.url}`}
                                            >
                                                <TunnelSelectOptionContent tunnel={tunnel} />
                                            </SelectItem>
                                        );
                                    }}
                                </StyledSelect>

                                <Button
                                    className="h-[38px] rounded-lg"
                                    color="primary"
                                    size="lg"
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

                            {!tunnelingSecrets && (
                                <DeeployInfoTag text="Please add your Cloudflare secrets to enable tunnel generation." />
                            )}
                        </div>
                    )}

                    {(!shouldShowTunnelAlternatives || selectedTunnelId === CUSTOM_TUNNEL_OPTION) && (
                        <div className="flex gap-4">
                            <InputWithLabel
                                name={`${baseName}.tunnelingToken`}
                                label="Tunnel Token"
                                placeholder="Starts with 'ey'"
                                isDisabled={isCreatingTunnel}
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
                    )}

                    {shouldShowTunnelAlternatives && selectedTunnelId !== CUSTOM_TUNNEL_OPTION && enableTunnelingLabel && (
                        <div className="flex gap-4">
                            <InputWithLabel
                                name={`${baseName}.tunnelingLabel`}
                                label="Tunnel Label"
                                placeholder="My_Tunnel"
                                isOptional
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function TunnelSelectOptionContent({ tunnel }: { tunnel: TunnelSelectOption }) {
    if (tunnel.isCustom) {
        return (
            <div className="row items-center gap-2 py-1">
                <div className="font-medium">{tunnel.alias}</div>
                <div className="font-roboto-mono text-xs text-slate-500">{tunnel.url}</div>
            </div>
        );
    }

    return (
        <div className="row items-center justify-between gap-2 py-1">
            <div className="row min-w-0 items-center gap-2">
                <div className="truncate font-medium">{tunnel.alias}</div>
                <div className="font-roboto-mono truncate text-xs text-slate-500">{tunnel.url}</div>
            </div>

            <div className="row shrink-0 items-center gap-1.5 text-xs">
                <div className={`h-2 w-2 rounded-full ${tunnelStatusColorClassName[tunnel.status]}`}></div>
                <div className="capitalize">{tunnel.status}</div>
            </div>
        </div>
    );
}
