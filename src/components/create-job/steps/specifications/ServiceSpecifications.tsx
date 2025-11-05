import { serviceContainerTypes } from '@data/services';
import { SlateCard } from '@shared/cards/SlateCard';
import ContainerResourcesInfo from '@shared/jobs/ContainerResourcesInfo';
import JobTags from '@shared/jobs/target-nodes/JobTags';
import SelectServiceContainerType from '../SelectServiceContainerType';

export default function ServiceSpecifications({ isEditingRunningJob }: { isEditingRunningJob?: boolean }) {
    return (
        <div className="col gap-6">
            <SlateCard title="Service Resources">
                <SelectServiceContainerType
                    name="specifications.serviceContainerType"
                    label="Container Type"
                    options={serviceContainerTypes}
                    isDisabled={isEditingRunningJob}
                />

                <ContainerResourcesInfo name="specifications.serviceContainerType" options={serviceContainerTypes} />
            </SlateCard>

            <SlateCard>
                <JobTags />
            </SlateCard>
        </div>
    );
}
