import clsx from 'clsx';
import { RiCodeBoxLine, RiText } from 'react-icons/ri';

export default function ValueTypeToggle({
    valueType = 'text',
    isDisabled,
    useFixedHeight = true,
    onClick,
}: {
    valueType?: 'text' | 'json';
    isDisabled?: boolean;
    useFixedHeight?: boolean;
    onClick?: () => void;
}) {
    return (
        <div
            className={clsx('center-all text-lg transition-opacity duration-150', {
                'h-10': useFixedHeight,
                'cursor-pointer text-slate-500 hover:opacity-60': !isDisabled,
                'text-slate-300': isDisabled,
            })}
            onClick={() => {
                if (isDisabled) {
                    return;
                }

                onClick?.();
            }}
            title={valueType === 'text' ? 'Switch to JSON' : 'Switch to Text'}
        >
            <div className="text-base">
                {valueType === 'text' ? <RiText /> : <RiCodeBoxLine />}
            </div>
        </div>
    );
}
