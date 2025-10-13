import { DC_TAG, KYB_TAG, KYC_TAG } from '@lib/deeploy-utils';
import { CopyableValue } from '@shared/CopyableValue';
import { SmallTag } from '@shared/SmallTag';
import clsx from 'clsx';
import { remove } from 'lodash';
import countries from 'world-countries';

const TAG_LABELS = {
    [KYB_TAG]: 'KYB-only',
    [KYC_TAG]: 'KYC-only',
    [DC_TAG]: 'Certified Data Centers',
};

const getCountryName = (countryCode: string): string => {
    const country = countries.find((c) => c.cca2 === countryCode);
    return country ? country.name.common : countryCode;
};

const formatTagDisplay = (item: string): string => {
    if (item.startsWith('CT:')) {
        const countryCode = item.substring(3); // Remove 'CT:' prefix
        return getCountryName(countryCode);
    }
    return TAG_LABELS[item] || item;
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

    const mainTags = remove(array, (item) => item === KYB_TAG || item === KYC_TAG || item === DC_TAG);

    return (
        <div
            className={clsx('mt-1 flex flex-wrap gap-1.5', {
                'flex-col': type === 'col',
                'flex-row items-center': type === 'row',
            })}
        >
            {[...mainTags, ...array].map((item, index) => (
                <SmallTag key={index} isLarge>
                    {getWrapper(
                        <div className="row font-roboto-mono gap-1.5">
                            {!!label && <div className="text-slate-400">{label}</div>}
                            <div>{formatTagDisplay(item)}</div>
                        </div>,
                        formatTagDisplay(item),
                    )}
                </SmallTag>
            ))}
        </div>
    );
}
