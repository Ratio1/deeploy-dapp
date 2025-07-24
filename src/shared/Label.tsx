interface Props {
    value: string;
}

export default function Label({ value }: Props) {
    return (
        <div className="row">
            <div className="compact text-slate-500">{value}</div>
        </div>
    );
}
