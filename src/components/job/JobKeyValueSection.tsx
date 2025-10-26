import { getShortAddressOrHash, isKeySecret } from '@lib/utils';
import { CopyableValue } from '@shared/CopyableValue';
import SecretValueToggle from '@shared/jobs/SecretValueToggle';
import { SmallTag } from '@shared/SmallTag';
import { useEffect, useState } from 'react';

export default function JobKeyValueSection({
    obj,
    labels = ['KEY', 'VALUE'],
    displayShortValues = true,
}: {
    obj: Record<string, any>;
    labels?: [string, string];
    displayShortValues?: boolean;
}) {
    const [isFieldSecret, setFieldSecret] = useState<{ [id: string]: boolean }>({});

    useEffect(() => {
        Object.keys(obj).forEach((key) => {
            if (isFieldSecret[key] === undefined) {
                setFieldSecret((previous) => ({
                    ...previous,
                    [key]: isKeySecret(key),
                }));
            }
        });
    }, [obj]);

    return (
        <div className="col mt-1 gap-1">
            {Object.entries(obj).map(([key, value]) => (
                <div key={key} className="row font-roboto-mono gap-1">
                    <SmallTag isLarge>
                        <div className="row gap-1.5">
                            <div className="text-slate-400">{labels[0]}</div>
                            <div>{key}</div>
                        </div>
                    </SmallTag>

                    <SmallTag isLarge>
                        <div className="row gap-1.5">
                            <div className="text-slate-400">{labels[1]}</div>

                            <CopyableValue value={value}>
                                {isFieldSecret[key]
                                    ? '•••••••••'
                                    : displayShortValues
                                      ? getShortAddressOrHash(value, 16, true)
                                      : value}

                                {isKeySecret(key) && (
                                    <SecretValueToggle
                                        isSecret={isFieldSecret[key]}
                                        useFixedHeight={false}
                                        onClick={() => {
                                            setFieldSecret((previous) => ({
                                                ...previous,
                                                [key]: !previous[key],
                                            }));
                                        }}
                                        isSmall
                                    />
                                )}
                            </CopyableValue>
                        </div>
                    </SmallTag>
                </div>
            ))}
        </div>
    );
}
