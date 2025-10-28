import { SmallTag } from '@shared/SmallTag';

export default function ConfigSectionTitle({
    title,
    variant = 'blue',
}: {
    title: string;
    variant?: 'blue' | 'green' | 'purple';
}) {
    return (
        <div className="row mt-1 w-full gap-3">
            <SmallTag variant={variant}>
                <div className="whitespace-nowrap">{title}</div>
            </SmallTag>
            <div className="w-full border-b-2 border-slate-200"></div>
        </div>
    );
}
