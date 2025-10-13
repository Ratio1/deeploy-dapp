import { getShortAddressOrHash, isKeySecret } from '@lib/utils';
import { CopyableValue } from '@shared/CopyableValue';
import SecretValueToggle from '@shared/jobs/SecretValueToggle';
import { SmallTag } from '@shared/SmallTag';
import { useEffect, useState } from 'react';

export default function JobKeyValueSection({ obj }: { obj: Record<string, any> }) {
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
                            <div className="text-slate-400">KEY</div>
                            <div>{key}</div>
                        </div>
                    </SmallTag>

                    <SmallTag isLarge>
                        <div className="row gap-1.5">
                            <div className="text-slate-400">VALUE</div>

                            <CopyableValue value={value}>
                                {isFieldSecret[key] ? '•••••••••' : getShortAddressOrHash(value, 16, true)}

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
