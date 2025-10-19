import AppParametersSection from '@components/create-job/sections/AppParametersSection';
import { ContainerOrWorkerType } from '@data/containerResources';
import { getContainerOrWorkerType } from '@lib/deeploy-utils';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import DynamicEnvSection from '@shared/jobs/DynamicEnvSection';
import EnvVariablesCard from '@shared/jobs/EnvVariablesCard';
import KeyValueEntriesSection from '@shared/jobs/KeyValueEntriesSection';
import TargetNodesCard from '@shared/jobs/target-nodes/TargetNodesCard';
import { JobSpecifications, JobType } from '@typedefs/deeploys';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

function ServiceDeployment({ isEditingJob }: { isEditingJob?: boolean }) {
    const { watch, setValue } = useFormContext();

    const jobType: JobType = watch('jobType');
    const specifications: JobSpecifications = watch('specifications');

    // Init
    useEffect(() => {
        if (!isEditingJob) {
            const containerOrWorkerType: ContainerOrWorkerType = getContainerOrWorkerType(jobType, specifications);

            if (containerOrWorkerType) {
                setValue('deployment.jobAlias', containerOrWorkerType.notes.split(' ')[0]);

                let envEntries: { key: string; value: string }[] = [];

                switch (containerOrWorkerType.dbSystem) {
                    case 'PostgreSQL':
                        envEntries = [{ key: 'POSTGRES_PASSWORD', value: '' }];
                        break;

                    case 'MySQL':
                        envEntries = [{ key: 'MYSQL_ROOT_PASSWORD', value: '' }];
                        break;

                    case 'MongoDB':
                        envEntries = [
                            { key: 'MONGO_INITDB_ROOT_USERNAME', value: '' },
                            { key: 'MONGO_INITDB_ROOT_PASSWORD', value: '' },
                        ];
                        break;
                }

                setValue('deployment.envVars', envEntries);
            }
        }
    }, []);

    return (
        <div className="col gap-6">
            <SlateCard title="Service Identity">
                <div className="flex gap-4">
                    <InputWithLabel name="deployment.jobAlias" label="Alias" placeholder="Service" />
                </div>
            </SlateCard>

            <TargetNodesCard isEditingJob={isEditingJob} />

            <SlateCard title="App Parameters">
                <AppParametersSection />
            </SlateCard>

            <EnvVariablesCard
                disabledKeys={[
                    'POSTGRES_PASSWORD',
                    'MYSQL_ROOT_PASSWORD',
                    'MONGO_INITDB_ROOT_USERNAME',
                    'MONGO_INITDB_ROOT_PASSWORD',
                ]}
            />

            <SlateCard title="Dynamic ENV Variables">
                <DynamicEnvSection />
            </SlateCard>

            <SlateCard title="Volumes">
                <KeyValueEntriesSection name="deployment.volumes" displayLabel="volumes" placeholders={['VOLUME', 'PATH']} />
            </SlateCard>

            <SlateCard title="Other">
                <InputWithLabel name="deployment.serviceReplica" label="Service Replica" placeholder="0x_ai" isOptional />
            </SlateCard>
        </div>
    );
}

export default ServiceDeployment;
