import { POLICY_TYPES } from '@data/policyTypes';
import SelectWithLabel from '@shared/SelectWithLabel';

export default function PoliciesSection({ baseName = 'deployment' }: { baseName?: string }) {
    return (
        <div className="flex gap-4">
            <SelectWithLabel name={`${baseName}.restartPolicy`} label="Restart Policy" options={POLICY_TYPES} />
            <SelectWithLabel name={`${baseName}.imagePullPolicy`} label="Image Pull Policy" options={POLICY_TYPES} />
        </div>
    );
}
