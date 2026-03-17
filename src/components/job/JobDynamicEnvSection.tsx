import { getShortAddressOrHash } from '@lib/utils';
import { SmallTag } from '@shared/SmallTag';

type LegacyDynamicEnvValue = {
    type?: string;
    value?: string;
    path?: [string, string];
};

type DynamicEnvUiValue = {
    source?: string;
    value?: string;
    provider?: string;
};

type DynamicEnvValue = LegacyDynamicEnvValue | DynamicEnvUiValue;

const getEntrySource = (entry: DynamicEnvValue) => {
    if ('source' in entry && entry.source) {
        return entry.source;
    }

    if ('type' in entry && entry.type === 'shmem') {
        return 'container_ip';
    }

    if ('type' in entry && entry.type) {
        return entry.type;
    }

    return 'static';
};

const getEntryValue = (entry: DynamicEnvValue) => {
    if ('provider' in entry && entry.provider) {
        return entry.provider;
    }

    if ('value' in entry && entry.value) {
        return entry.value;
    }

    if ('path' in entry && Array.isArray(entry.path) && entry.path.length === 2) {
        return `${entry.path[0]} / ${entry.path[1]}`;
    }

    return '—';
};

export default function JobDynamicEnvSection({
    dynamicEnv,
}: {
    dynamicEnv?: Record<string, DynamicEnvValue[]>;
}) {
    if (!dynamicEnv || Object.keys(dynamicEnv).length === 0) {
        return null;
    }

    return (
        <div className="col mt-1 gap-1">
            {Object.entries(dynamicEnv).map(([key, values]) => (
                <div key={key} className="col font-roboto-mono gap-1.5">
                    <SmallTag isLarge>
                        <div className="row gap-1.5">
                            <div className="text-slate-400">KEY</div>
                            <div>{key}</div>
                        </div>
                    </SmallTag>

                    <div className="col">
                        {values.map((entry, index) => {
                            const source = getEntrySource(entry);
                            const value = getEntryValue(entry);

                            return (
                                <div key={index} className="row gap-1">
                                    <div className="row relative mr-2 ml-2.5">
                                        <div className="h-[28px] w-0.5 bg-slate-300"></div>
                                        <div className="h-0.5 w-4 bg-slate-300"></div>

                                        {index === values.length - 1 && (
                                            <div className="bg-slate-75 absolute bottom-0 left-0 h-[13px] w-0.5"></div>
                                        )}
                                    </div>

                                    <SmallTag isLarge>
                                        <div className="row gap-1.5">
                                            <div className="text-slate-400">SOURCE</div>
                                            <div>{source}</div>
                                        </div>
                                    </SmallTag>

                                    <SmallTag isLarge>
                                        <div className="row gap-1.5">
                                            <div className="text-slate-400">VALUE</div>
                                            <div>{value === '—' ? value : getShortAddressOrHash(value, 24, true)}</div>
                                        </div>
                                    </SmallTag>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
