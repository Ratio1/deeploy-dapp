import KeyValueEntriesSection from './KeyValueEntriesSection';

// This component assumes it's being used in the deployment step
export default function EnvVariablesSection({ disabledKeys }: { disabledKeys?: string[] }) {
    return (
        <KeyValueEntriesSection
            name="deployment.envVars"
            displayLabel="environment variables"
            disabledKeys={disabledKeys}
            enableSecretValues
        />
    );
}
