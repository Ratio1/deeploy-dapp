import { FunctionComponent, PropsWithChildren, useState } from 'react';
import { RiCheckLine, RiFileCopyLine } from 'react-icons/ri';

interface Props {
    value: string;
}

export const CopyableValue: FunctionComponent<PropsWithChildren<Props>> = ({ value, children }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 1000);
    };

    return (
        <div className="row gap-1">
            {children}

            <div className="text-primary-300">
                {!copied ? (
                    <RiFileCopyLine
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleCopy();
                        }}
                        className="cursor-pointer hover:opacity-60"
                    />
                ) : (
                    <RiCheckLine />
                )}
            </div>
        </div>
    );
};
