import { ReactNode } from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';

export default function DeeployWarningAlert({ title, description }: { title: ReactNode; description: ReactNode }) {
    return (
        <div className="text-warning-800 bg-warning-100 col gap-2 rounded-md p-3 text-sm">
            <div className="row gap-1.5">
                <RiErrorWarningLine className="text-[20px]" />

                {title}
            </div>

            <div>{description}</div>
        </div>
    );
}
