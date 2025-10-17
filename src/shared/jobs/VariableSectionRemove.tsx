import clsx from 'clsx';

export default function VariableSectionRemove({ onClick, fixedHeight = true }: { onClick: () => void; fixedHeight?: boolean }) {
    return (
        <div
            className={clsx('center-all compact cursor-pointer text-slate-500 hover:opacity-50', {
                'h-10': fixedHeight,
            })}
            onClick={onClick}
        >
            <div>Remove</div>
        </div>
    );
}
