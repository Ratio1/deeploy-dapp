import { ReactNode } from 'react';
import { RiInformationLine } from 'react-icons/ri';

export default function DeeployInfoAlert({ title, description }: { title: ReactNode; description: ReactNode }) {
    return (
        <div className="col gap-2 rounded-md bg-blue-100 p-3 text-sm text-blue-600">
            <div className="row gap-1.5">
                <RiInformationLine className="text-[20px]" />

                {title}
            </div>

            <div>{description}</div>
        </div>
    );
}
