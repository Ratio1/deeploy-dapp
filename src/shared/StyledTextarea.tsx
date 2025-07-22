import { Textarea, TextAreaProps } from '@heroui/input';

interface StyledTextareaProps extends TextAreaProps {
    inputWrapperClassnames?: string;
}

export default function StyledTextarea({ inputWrapperClassnames, ...props }: StyledTextareaProps) {
    return (
        <Textarea
            className="w-[100%]"
            size="md"
            classNames={{
                inputWrapper: `rounded-lg bg-[#fcfcfd] shadow-none !transition-shadow border data-[hover=true]:border-slate-300 group-data-[focus=true]:border-slate-400 group-data-[focus=true]:shadow-custom ${inputWrapperClassnames || ''}`,
                input: 'font-medium placeholder:text-slate-400 !h-full',
                errorMessage: 'text-sm',
            }}
            variant="bordered"
            {...props}
        />
    );
}
