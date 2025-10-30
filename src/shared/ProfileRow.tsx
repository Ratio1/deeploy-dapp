export default function ProfileRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="compact flex flex-col gap-0.5 sm:h-6 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
            <div className="text-slate-500">{label}</div>

            <div className="max-w-[360px]">
                <div className="overflow-hidden text-ellipsis whitespace-nowrap">{value}</div>
            </div>
        </div>
    );
}
