import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';
import InputWithLabel from '../../InputWithLabel';

export default function ContainerSection({ baseName = 'deployment' }: { baseName?: string }) {
    const { watch, setValue, clearErrors } = useFormContext();

    const crVisibility: 'Public' | 'Private' = watch(`${baseName}.deploymentType.crVisibility`);

    return (
        <div className="col gap-4">
            <div className="flex gap-4">
                <InputWithLabel
                    name={`${baseName}.deploymentType.containerImage`}
                    label="Image"
                    placeholder="e.g., Ratio1/deeploy-dapp:latest"
                    labelHelp="Container image reference to run on node workers (repository/name[:tag])."
                />
                <InputWithLabel
                    name={`${baseName}.deploymentType.containerRegistry`}
                    label="Container Registry"
                    placeholder="docker.io"
                    labelHelp="Registry domain hosting the image. Example: docker.io, ghcr.io, registry.example.com."
                />
            </div>

            <div className="flex max-w-[50%] pr-2">
                <SelectWithLabel
                    name={`${baseName}.deploymentType.crVisibility`}
                    label="Registry Visibility"
                    labelHelp="Private registries require credentials so nodes can pull images at runtime."
                    options={CR_VISIBILITY_OPTIONS}
                    onSelect={(value) => {
                        if (value === 'Public') {
                            setValue(`${baseName}.deploymentType.crUsername`, '');
                            setValue(`${baseName}.deploymentType.crPassword`, '');
                            clearErrors(`${baseName}.deploymentType.crUsername`);
                            clearErrors(`${baseName}.deploymentType.crPassword`);
                        }
                    }}
                />
            </div>

            {crVisibility === 'Private' && (
                <div className="flex gap-4">
                    <InputWithLabel
                        name={`${baseName}.deploymentType.crUsername`}
                        autoComplete="username"
                        label="Username"
                        placeholder=""
                        labelHelp="Registry username used when visibility is Private."
                    />
                    <InputWithLabel
                        name={`${baseName}.deploymentType.crPassword`}
                        type="password"
                        autoComplete="current-password"
                        label="Password or Authentication Token"
                        placeholder=""
                        labelHelp="Registry password or access token used to authenticate image pulls."
                    />
                </div>
            )}
        </div>
    );
}
