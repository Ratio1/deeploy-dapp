import { NATIVE_PLUGIN_DEFAULT_RESPONSE_KEYS } from '@lib/deeploy-utils';
import ItemWithBoldValue from '@shared/jobs/ItemWithBoldValue';
import { JobConfig } from '@typedefs/deeployApi';
import JobKeyValueSection from '../JobKeyValueSection';
import ConfigSectionTitle from './ConfigSectionTitle';

export default function ConfigNative({ jobConfig }: { jobConfig: JobConfig }) {
    return (
        <>
            <ConfigSectionTitle title="Native Plugin" variant="green" />

            <ItemWithBoldValue
                label="Custom Parameters"
                value={
                    <JobKeyValueSection
                        obj={Object.fromEntries(
                            Object.entries(jobConfig)
                                .filter(([key, _]) => !NATIVE_PLUGIN_DEFAULT_RESPONSE_KEYS.includes(key as keyof JobConfig))
                                .map(([key, value]) => [key, JSON.stringify(value)]),
                        )}
                        displayShortValues={false}
                    />
                }
            />
        </>
    );
}
