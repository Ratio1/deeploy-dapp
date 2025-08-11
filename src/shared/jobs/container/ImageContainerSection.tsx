import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import SelectWithLabel from '@shared/SelectWithLabel';
import { useFormContext } from 'react-hook-form';
import InputWithLabel from '../../InputWithLabel';

export default function ImageContainerSection() {
    const { watch } = useFormContext();

    const crVisibility: 'Public' | 'Private' = watch('deployment.container.crVisibility');

    return (
        <div className="col gap-4">
            <div className="flex gap-4">
                <InputWithLabel name="deployment.container.containerImage" label="Image" placeholder="repo/image:tag" />
                <InputWithLabel
                    name="deployment.container.containerRegistry"
                    label="Container Registry"
                    placeholder="docker.com"
                />
            </div>

            <div className="flex max-w-[50%] pr-2">
                <SelectWithLabel
                    name="deployment.container.crVisibility"
                    label="Registry Visibility"
                    options={CR_VISIBILITY_OPTIONS}
                />
            </div>

            {crVisibility === 'Private' && (
                <div className="flex gap-4">
                    <InputWithLabel
                        name="deployment.container.crUsername"
                        autoComplete="username"
                        label="Username"
                        placeholder=""
                    />
                    <InputWithLabel
                        name="deployment.container.crPassword"
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
