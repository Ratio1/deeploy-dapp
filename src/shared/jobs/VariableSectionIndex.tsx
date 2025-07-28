export default function VariableSectionIndex({ index }: { index: number }) {
    return (
        <div className="center-all h-10">
            <div className="compact min-w-4 text-slate-500">{index + 1}</div>
        </div>
    );
}
