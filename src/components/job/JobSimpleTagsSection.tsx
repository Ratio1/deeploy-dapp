import { DC_TAG, KYB_TAG } from '@lib/deeploy-utils';
import { CopyableValue } from '@shared/CopyableValue';
import { SmallTag } from '@shared/SmallTag';
import clsx from 'clsx';

const TAG_LABELS = {
    [KYB_TAG]: 'KYB',
    [DC_TAG]: 'Certified Data Centers',
};

export default function JobSimpleTagsSection({
    array,
    type = 'row',
    label,
    copyable = false,
}: {
    array: string[];
    type?: 'row' | 'col';
    label?: string;
    copyable?: boolean;
}) {
    const getWrapper = (element: React.ReactNode, value: string) => {
        if (copyable) {
            return <CopyableValue value={value}>{element}</CopyableValue>;
        }

        return element;
    };

    return (
        <div
            className={clsx('mt-1 flex flex-wrap gap-1.5', {
                'flex-col': type === 'col',
                'flex-row items-center': type === 'row',
            })}
        >
            {array
                .filter((item) => item !== '')
                .map((item, index) => (
                    <SmallTag key={index} isLarge>
                        {getWrapper(
                            <div className="row font-roboto-mono gap-1.5">
                                {!!label && <div className="text-slate-400">{label}</div>}
                                <div>{TAG_LABELS[item] || item}</div>
                            </div>,
                            TAG_LABELS[item] || item,
                        )}
                    </SmallTag>
                ))}
        </div>
    );
}
