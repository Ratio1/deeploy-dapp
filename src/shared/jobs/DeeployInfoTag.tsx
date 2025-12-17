import { SmallTag } from '@shared/SmallTag';
import { ReactNode } from 'react';
import { RiInformationLine } from 'react-icons/ri';

export default function DeeployInfoTag({ text }: { text: string | ReactNode }) {
    return (
        <SmallTag variant="lightslate" isLarge>
            <div className="flex items-start gap-1 py-1 text-slate-500">
                <div className="row h-5">
                    <RiInformationLine className="text-lg" />
                </div>

                <div className="font-normal">{text}</div>
            </div>
        </SmallTag>
    );
}
