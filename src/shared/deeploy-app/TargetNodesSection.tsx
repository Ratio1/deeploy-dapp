import StyledInput from '@shared/StyledInput';
import { RiAddLine } from 'react-icons/ri';

export default function TargetNodesSection() {
    return (
        <div className="col gap-4">
            <div className="col gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div className="row gap-3" key={index}>
                        <div className="min-w-4 text-sm font-medium text-slate-500">{index + 1}</div>

                        <StyledInput placeholder="0x_ai" />

                        <div className="cursor-pointer text-sm font-medium text-slate-500 hover:opacity-50">Remove</div>
                    </div>
                ))}
            </div>

            <div className="row cursor-pointer gap-0.5 text-sm font-medium text-primary hover:opacity-50">
                <RiAddLine className="text-lg" /> Add Node
            </div>
        </div>
    );
}
