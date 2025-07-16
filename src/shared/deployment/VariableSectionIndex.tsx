export default function VariableSectionIndex({ index }: { index: number }) {
    return (
        <div className="center-all h-10">
            <div className="min-w-4 text-sm font-medium text-slate-500">{index + 1}</div>
        </div>
    );
}
