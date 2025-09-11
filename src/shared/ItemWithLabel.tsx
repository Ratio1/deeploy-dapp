export default function ItemWithLabel({ label, value }: { label: string; value: string | React.ReactNode }) {
    return (
        <div className="col text-sm">
            <div className="font-medium text-slate-500">{label}</div>
            <div className="row min-h-[22px]">{value}</div>
        </div>
    );
}
