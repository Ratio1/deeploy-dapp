'use client';

import AppParametersSection from '@components/create-job/sections/AppParametersSection';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import services, { Service } from '@data/services';
import { Button } from '@heroui/button';
import { Checkbox } from '@heroui/checkbox';
import { createTunnel } from '@lib/api/tunnels';
import { DeploymentContextType } from '@lib/contexts/deployment/context';
import { useDeploymentContext } from '@lib/contexts/deployment/hook';
import { TunnelsContextType, useTunnelsContext } from '@lib/contexts/tunnels';
import { routePath } from '@lib/routes/route-paths';
import { stripToAlphanumeric } from '@lib/utils';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import DeeployInfoTag from '@shared/jobs/DeeployInfoTag';
import ServiceInputsSection from '@shared/jobs/ServiceInputsSection';
import TargetNodesCard from '@shared/jobs/target-nodes/TargetNodesCard';
import PortMappingSection from '@shared/PortMappingSection';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiCodeSSlashLine } from 'react-icons/ri';

function ServiceDeployment({ isEditingRunningJob }: { isEditingRunningJob?: boolean }) {
    const { setFormSubmissionDisabled, getProjectName } = useDeploymentContext() as DeploymentContextType;
    const { tunnelingSecrets } = useTunnelsContext() as TunnelsContextType;

    const { watch, setValue, clearErrors } = useFormContext();
    const { projectHash } = useParams<{ projectHash?: string }>();

    const serviceId: number = watch('serviceId');
    const alias: string = watch('deployment.jobAlias');
    const isPublicService: boolean = watch('deployment.isPublicService');
    const ports = watch('deployment.ports');

    const service: Service = services.find((service) => service.id === serviceId)!;

    const [isCreatingTunnel, setCreatingTunnel] = useState<boolean>(false);
    const [generatedPortMapping, setGeneratedPortMapping] = useState<boolean>(false);

    useEffect(() => {
        if (!alias || alias === '') {
            setValue('deployment.jobAlias', stripToAlphanumeric(service.name).toLowerCase());
        }
    }, [alias]);

    useEffect(() => {
        setValue('deployment.port', service.port);
    }, [service]);

    useEffect(() => {
        if (!isPublicService && !generatedPortMapping) {
            const hasPorts = Array.isArray(ports) && ports.length > 0;
            if (!hasPorts) {
                const hostPort = 32000 + Math.floor(Math.random() * 700) + 1;
                setValue('deployment.ports', [{ hostPort, containerPort: service.port }], {
                    shouldDirty: true,
                    shouldValidate: true,
                });
                setGeneratedPortMapping(true);
            }
        }
    }, [isPublicService, ports, service.port, setValue]);

    useEffect(() => {
        setValue('deployment.enableTunneling', isPublicService ? BOOLEAN_TYPES[0] : BOOLEAN_TYPES[1], {
            shouldDirty: true,
            shouldValidate: true,
        });

        if (isPublicService) {
            setValue('deployment.ports', [], { shouldDirty: true });
        } else {
            setValue('deployment.tunnelingToken', undefined);
            setValue('deployment.tunnelingLabel', undefined);
            clearErrors('deployment.tunnelingToken');
            clearErrors('deployment.tunnelingLabel');
        }
    }, [isPublicService, setValue]);

    const onGenerateTunnel = async () => {
        if (!tunnelingSecrets) {
            throw new Error('No tunneling secrets found.');
        }

        setFormSubmissionDisabled(true);
        setCreatingTunnel(true);

        try {
            const projectName = projectHash ? getProjectName(projectHash) : '';
            const tunnelAlias = projectName ? `${stripToAlphanumeric(projectName).toLowerCase()}-${alias}` : alias;

            console.log('Creating tunnel', tunnelAlias, stripToAlphanumeric(service.name).toLowerCase());
            const response = await createTunnel(tunnelAlias, tunnelingSecrets, stripToAlphanumeric(service.name).toLowerCase());

            if (!response.result.id) {
                throw new Error('Failed to create tunnel.');
            }

            console.log('Tunnel created', response.result);

            setValue('deployment.tunnelingToken', response.result.metadata.tunnel_token);
            setValue('tunnelURL', response.result.metadata.dns_name);
        } catch (error) {
            console.error(error);
            toast.error('Failed to create tunnel.');
        } finally {
            setCreatingTunnel(false);
            setFormSubmissionDisabled(false);
        }
    };

    return (
        <div className="col gap-6">
            <SlateCard title="Service Identity">
                <div className="flex gap-4">
                    <InputWithLabel
                        name="deployment.jobAlias"
                        label="Alias"
                        placeholder="Service"
                        isDisabled={isEditingRunningJob}
                    />
                </div>
            </SlateCard>

            <TargetNodesCard isEditingRunningJob={isEditingRunningJob} />

            <SlateCard
                title="Service Parameters"
                label={
                    isPublicService && (
                        <Button
                            className="h-[34px]"
                            color="primary"
                            size="sm"
                            onPress={onGenerateTunnel}
                            isLoading={isCreatingTunnel}
                            isDisabled={!tunnelingSecrets || isEditingRunningJob}
                        >
                            <div className="row gap-1.5">
                                <RiCodeSSlashLine className="text-base" />
                                <div className="compact">Generate Tunnel</div>
                            </div>
                        </Button>
                    )
                }
            >
                <div className="col gap-4">
                    {!isEditingRunningJob && (
                        <Checkbox
                            isSelected={isPublicService}
                            onValueChange={(value) => setValue('deployment.isPublicService', value, { shouldDirty: true })}
                        >
                            <div className="compact">Public Service</div>
                        </Checkbox>
                    )}

                    {isPublicService && !tunnelingSecrets && (
                        <DeeployInfoTag
                            text={
                                <>
                                    Please add your{' '}
                                    <Link href={routePath.tunnels} className="text-primary font-medium hover:opacity-70">
                                        Cloudflare secrets
                                    </Link>{' '}
                                    to enable tunnel generation.
                                </>
                            }
                        />
                    )}

                    {isPublicService ? (
                        <AppParametersSection
                            enablePort={false}
                            isCreatingTunnel={isCreatingTunnel}
                            enableTunnelingLabel={service.tunnelEngine === 'ngrok'}
                            forceTunnelingEnabled
                        />
                    ) : (
                        <div className="col gap-2">
                            <DeeployInfoTag
                                text={<>Add a port mapping of type HOST_PORT to SERVICE_PORT ({service.port}).</>}
                            />

                            <PortMappingSection />
                        </div>
                    )}
                </div>
            </SlateCard>

            {service?.inputs?.length > 0 && <ServiceInputsSection inputs={service.inputs} />}

            {/* <SlateCard title="Other">
                <InputWithLabel name="deployment.serviceReplica" label="Service Replica" placeholder="0x_ai" isOptional />
            </SlateCard> */}
        </div>
    );
}

export default ServiceDeployment;
