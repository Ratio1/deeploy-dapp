import { SmallTag } from '@shared/SmallTag';

export default function JobSimpleTagsSection({ array, label }: { array: string[]; label?: string }) {
    return (
        <div className="col mt-1 gap-1">
            {array.map((item, index) => (
                <SmallTag key={index} isLarge>
                    <div className="row font-roboto-mono gap-1.5">
                        {!!label && <div className="text-slate-400">{label}</div>}
                        <div>{item}</div>
                    </div>
                </SmallTag>
            ))}
        </div>
    );
}
