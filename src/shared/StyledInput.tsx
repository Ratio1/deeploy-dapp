import { Input, InputProps } from '@heroui/input';

interface Props extends InputProps {
    showsWarning?: boolean;
}

export default function StyledInput({ showsWarning, ...props }: Props) {
    return (
        <Input
            className="w-full"
            size="md"
            classNames={{
                inputWrapper: `rounded-lg bg-light shadow-none transition-shadow! border data-[hover=true]:border-slate-300 group-data-[focus=true]:border-slate-400 group-data-[focus=true]:shadow-custom ${
                    showsWarning ? 'shadow-warning! border-[#ffdfac]!' : ''
                }`,
                input: 'font-medium placeholder:text-slate-400',
                errorMessage: 'text-sm',
            }}
            variant="bordered"
            {...props}
        />
    );
}
