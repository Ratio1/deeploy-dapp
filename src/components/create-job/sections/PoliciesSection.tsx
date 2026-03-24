import { POLICY_TYPES } from '@data/policyTypes';
import SelectWithLabel from '@shared/SelectWithLabel';

export default function PoliciesSection({ baseName = 'deployment' }: { baseName?: string }) {
    return (
        <div className="flex gap-4">
            <SelectWithLabel
                name={`${baseName}.restartPolicy`}
                label="Restart Policy"
                labelHelp="Controls whether the app should automatically restart after failures."
                options={POLICY_TYPES}
            />
            <SelectWithLabel
                name={`${baseName}.imagePullPolicy`}
                label="Image Pull Policy"
                labelHelp="Controls when a fresh container image is pulled from the registry."
                options={POLICY_TYPES}
            />
        </div>
    );
}
