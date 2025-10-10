import { SmallTag } from './SmallTag';

interface Props {
    value: string;
    isOptional?: boolean;
    tag?: React.ReactNode;
}

export default function Label({ value, isOptional, tag }: Props) {
    return (
        <div className="row gap-1">
            <div className="compact text-slate-500">{value}</div>
            {isOptional && <SmallTag>Optional</SmallTag>}
            {tag && tag}
        </div>
    );
}
