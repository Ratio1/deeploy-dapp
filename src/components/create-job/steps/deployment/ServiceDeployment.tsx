import AppParametersSection from '@components/create-job/sections/AppParametersSection';
import services, { Service } from '@data/services';
import { Button } from '@heroui/button';
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
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiCodeSSlashLine } from 'react-icons/ri';
import { Link, useParams } from 'react-router-dom';

function ServiceDeployment({ isEditingRunningJob }: { isEditingRunningJob?: boolean }) {
    const { setFormSubmissionDisabled, getProjectName } = useDeploymentContext() as DeploymentContextType;
    const { tunnelingSecrets } = useTunnelsContext() as TunnelsContextType;

    const { watch, setValue } = useFormContext();
    const { projectHash } = useParams();

    const serviceId: number = watch('serviceId');
    const alias: string = watch('deployment.jobAlias');

    const service: Service = services.find((service) => service.id === serviceId)!;

    const [isCreatingTunnel, setCreatingTunnel] = useState<boolean>(false);

    useEffect(() => {
        if (!alias || alias === '') {
            setValue('deployment.jobAlias', stripToAlphanumeric(service.name).toLowerCase());
        }
    }, [alias]);

    useEffect(() => {
        setValue('deployment.port', service.port);
    }, [service]);

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
                    <InputWithLabel name="deployment.jobAlias" label="Alias" placeholder="Service" />
                </div>
            </SlateCard>

            <TargetNodesCard isEditingRunningJob={isEditingRunningJob} />

            <SlateCard
                title="Tunneling"
                label={
                    <Button
                        className="h-[34px]"
                        color="primary"
                        size="sm"
                        onPress={onGenerateTunnel}
                        isLoading={isCreatingTunnel}
                        isDisabled={!tunnelingSecrets}
                    >
                        <div className="row gap-1.5">
                            <RiCodeSSlashLine className="text-base" />
                            <div className="compact">Generate Tunnel</div>
                        </div>
                    </Button>
                }
            >
                {!tunnelingSecrets && (
                    <DeeployInfoTag
                        text={
                            <>
                                Please add your{' '}
                                <Link to={routePath.tunnels} className="text-primary font-medium hover:opacity-70">
                                    Cloudflare secrets
                                </Link>{' '}
                                to enable tunnel generation.
                            </>
                        }
                    />
                )}

                <AppParametersSection
                    enablePort={false}
                    isCreatingTunnel={isCreatingTunnel}
                    enableTunnelingLabel
                    forceTunnelingEnabled
                />
            </SlateCard>

            {service?.inputs?.length > 0 && <ServiceInputsSection inputs={service.inputs} />}

            {/* <SlateCard title="Other">
                <InputWithLabel name="deployment.serviceReplica" label="Service Replica" placeholder="0x_ai" isOptional />
            </SlateCard> */}
        </div>
    );
}

export default ServiceDeployment;
