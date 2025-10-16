import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';
import InputWithLabel from '../../InputWithLabel';

export default function ContainerImageSection() {
    const { watch } = useFormContext();

    const crVisibility: 'Public' | 'Private' = watch('deployment.deploymentType.crVisibility');

    return (
        <div className="col gap-4">
            <div className="flex gap-4">
                <InputWithLabel
                    name="deployment.deploymentType.containerImage"
                    label="Image"
                    placeholder="e.g. Ratio1/deeploy-dapp:latest"
                />
                <InputWithLabel
                    name="deployment.deploymentType.containerRegistry"
                    label="Container Registry"
                    placeholder="docker.io"
                />
            </div>

            <div className="flex max-w-[50%] pr-2">
                <SelectWithLabel
                    name="deployment.deploymentType.crVisibility"
                    label="Registry Visibility"
                    options={CR_VISIBILITY_OPTIONS}
                />
            </div>

            {crVisibility === 'Private' && (
                <div className="flex gap-4">
                    <InputWithLabel
                        name="deployment.deploymentType.crUsername"
                        autoComplete="username"
                        label="Username"
                        placeholder=""
                    />
                    <InputWithLabel
                        name="deployment.deploymentType.crPassword"
                        type="password"
                        autoComplete="current-password"
                        label="Password or Authentication Token"
                        placeholder=""
                    />
                </div>
            )}
        </div>
    );
}
