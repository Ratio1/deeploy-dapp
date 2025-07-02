import SelectCustom from '@shared/SelectCustom';
import StyledInput from '@shared/StyledInput';
import { RiAddLine } from 'react-icons/ri';

export default function DynamicEnvSection() {
    return (
        <div className="col gap-4">
            <div className="col gap-4">
                {Array.from({ length: 2 }).map((_, index) => (
                    <div className="col gap-2" key={index}>
                        <div className="row gap-3">
                            <div className="min-w-4 text-sm font-medium text-slate-500">{index + 1}</div>

                            <StyledInput placeholder="KEY" />

                            <div className="cursor-pointer text-sm font-medium text-slate-500 hover:opacity-50">Remove</div>
                        </div>

                        <div className="row gap-3">
                            <div className="flex w-full gap-2 pl-7">
                                <SelectCustom options={['Static', 'Host IP']} />
                                <StyledInput placeholder="None" />
                            </div>

                            {/* Hidden, used only for styling */}
                            <div className="invisible text-sm font-medium text-slate-500">Remove</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row cursor-pointer gap-0.5 text-sm font-medium text-primary hover:opacity-50">
                <RiAddLine className="text-lg" /> Add
            </div>
        </div>
    );
}
