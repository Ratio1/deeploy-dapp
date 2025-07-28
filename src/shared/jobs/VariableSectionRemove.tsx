export default function VariableSectionRemove({ onClick }: { onClick: () => void }) {
    return (
        <div className="center-all compact h-10 cursor-pointer text-slate-500 hover:opacity-50" onClick={onClick}>
            <div>Remove</div>
        </div>
    );
}
