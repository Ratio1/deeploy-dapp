interface Props {
    value: string;
}

export default function Label({ value }: Props) {
    return (
        <div className="row">
            <div className="text-sm font-medium text-slate-500">{value}</div>
        </div>
    );
}
