import { getShortAddressOrHash } from '@lib/utils';
import { SmallTag } from '@shared/SmallTag';

export default function JobFileVolumesSection({ obj }: { obj: Record<string, { content: string; mounting_point: string }> }) {
    return (
        <div className="col mt-1 gap-1">
            {Object.entries(obj).map(([key, value]) => (
                <div key={key} className="row font-roboto-mono gap-1">
                    <SmallTag isLarge>
                        <div className="row gap-1.5">
                            <div className="text-slate-400">NAME</div>
                            <div>{key}</div>
                        </div>
                    </SmallTag>

                    <SmallTag isLarge>
                        <div className="row gap-1.5">
                            <div className="text-slate-400">PATH</div>
                            <div>{getShortAddressOrHash(value.mounting_point, 16, true)}</div>
                        </div>
                    </SmallTag>
                </div>
            ))}
        </div>
    );
}
