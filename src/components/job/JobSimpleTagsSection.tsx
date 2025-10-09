import { DC_TAG, KYB_TAG } from '@lib/deeploy-utils';
import { SmallTag } from '@shared/SmallTag';

const TAG_LABELS = {
    [KYB_TAG]: 'KYB',
    [DC_TAG]: 'Certified Data Centers',
};

export default function JobSimpleTagsSection({ array, label }: { array: string[]; label?: string }) {
    return (
        <div className="row mt-1 flex-wrap gap-1.5">
            {array
                .filter((item) => item !== '')
                .map((item, index) => (
                    <SmallTag key={index} isLarge>
                        <div className="row font-roboto-mono gap-1.5">
                            {!!label && <div className="text-slate-400">{label}</div>}
                            <div>{TAG_LABELS[item] || item}</div>
                        </div>
                    </SmallTag>
                ))}
        </div>
    );
}
