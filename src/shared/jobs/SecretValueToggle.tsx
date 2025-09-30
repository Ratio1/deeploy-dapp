import clsx from 'clsx';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

export default function SecretValueToggle({
    isSecret,
    isDisabled,
    useFixedHeight = true,
    isSmall = false,
    onClick,
}: {
    isSecret?: boolean;
    isDisabled?: boolean;
    useFixedHeight?: boolean;
    isSmall?: boolean;
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
        >
            <div className={clsx({ 'text-sm': isSmall, 'text-base': !isSmall })}>
                {!isSecret ? <RiEyeLine /> : <RiEyeOffLine />}
            </div>
        </div>
    );
}
