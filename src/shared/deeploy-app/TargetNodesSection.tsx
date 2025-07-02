import { Input } from '@heroui/input';
import { RiAddLine } from 'react-icons/ri';

export default function TargetNodesSection() {
    return (
        <div className="col gap-4">
            <div className="col gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div className="row gap-3" key={index}>
                        <div className="min-w-4 text-sm font-medium text-slate-500">{index + 1}</div>

                        <Input
                            className="w-[100%]"
                            size="md"
                            classNames={{
                                inputWrapper:
                                    'rounded-lg bg-[#fcfcfd] !transition-shadow border data-[hover=true]:border-slate-300 group-data-[focus=true]:border-slate-400 group-data-[focus=true]:shadow-testing',
                                input: 'font-medium placeholder:text-slate-400',
                            }}
                            variant="bordered"
                            placeholder="0x_ai"
                        />

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
