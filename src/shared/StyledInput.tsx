import { Input, InputProps } from '@heroui/input';

export default function StyledInput(props: InputProps) {
    return (
        <Input
            className="w-[100%]"
            size="md"
            classNames={{
                inputWrapper:
                    'rounded-lg bg-[#fcfcfd] !transition-shadow border data-[hover=true]:border-slate-300 group-data-[focus=true]:border-slate-400 group-data-[focus=true]:shadow-testing',
                input: 'font-medium placeholder:text-slate-400',
                errorMessage: 'text-sm',
            }}
            variant="bordered"
            {...props}
        />
    );
}
