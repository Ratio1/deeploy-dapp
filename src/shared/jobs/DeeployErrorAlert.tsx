import { ReactNode } from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';

export default function DeeployErrorAlert({ title, description }: { title: ReactNode; description: ReactNode }) {
    return (
        <div className="col gap-2 rounded-md bg-red-100 p-3 text-sm text-red-700">
            <div className="row gap-1.5">
                <RiErrorWarningLine className="text-[20px]" />

                {title}
            </div>

            <div>{description}</div>
        </div>
    );
}
