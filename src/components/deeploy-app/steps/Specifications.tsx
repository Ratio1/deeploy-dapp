import { Input } from '@heroui/input';

function Specifications() {
    return (
        <div className="rounded-lg bg-slate-100 p-4">
            <div className="grid grid-cols-2 gap-2">
                <div className="row">
                    <div className="text-sm font-medium text-slate-700">Target nodes count</div>
                </div>

                <Input
                    size="md"
                    classNames={{
                        inputWrapper:
                            'rounded-lg bg-[#fcfcfd] !transition-shadow border data-[hover=true]:border-slate-300 group-data-[focus=true]:border-slate-400 group-data-[focus=true]:shadow-testing',
                        input: 'font-medium placeholder:text-slate-400',
                    }}
                    variant="bordered"
                    placeholder="0"
                />
            </div>
        </div>
    );
}

export default Specifications;
