import { DYNAMIC_ENV_TYPES } from '@data/dynamicEnvTypes';
import { getShortAddressOrHash } from '@lib/utils';
import { SmallTag } from '@shared/SmallTag';

export default function JobDynamicEnvSection({
    dynamicEnv,
}: {
    dynamicEnv: Record<string, { type: (typeof DYNAMIC_ENV_TYPES)[number]; value: string }[]>;
}) {
    if (!dynamicEnv) {
        return null;
    }

    return (
        <div className="col mt-1 gap-1">
            {Object.entries(dynamicEnv).map(([key, array]) => (
                <div key={key} className="col font-roboto-mono gap-1.5">
                    <SmallTag isLarge>
                        <div className="row gap-1.5">
                            <div className="text-slate-400">KEY</div>
                            <div>{key}</div>
                        </div>
                    </SmallTag>

                    <div className="col">
                        {array.map((item, index) => {
                            return (
                                <div key={index} className="row gap-1">
                                    {/* Tree Line */}
                                    <div className="row relative mr-2 ml-2.5">
                                        <div className="h-[28px] w-0.5 bg-slate-300"></div>
                                        <div className="h-0.5 w-4 bg-slate-300"></div>

                                        {index === array.length - 1 && (
                                            <div className="bg-slate-75 absolute bottom-0 left-0 h-[13px] w-0.5"></div>
                                        )}
                                    </div>

                                    <SmallTag isLarge>
                                        <div className="row gap-1.5">
                                            <div className="text-slate-400">TYPE</div>
                                            <div>{item.type}</div>
                                        </div>
                                    </SmallTag>

                                    <SmallTag isLarge>
                                        <div className="row gap-1.5">
                                            <div className="text-slate-400">VALUE</div>
                                            <div>{getShortAddressOrHash(item.value, 16, true)}</div>
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
