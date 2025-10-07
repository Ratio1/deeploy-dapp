import { InputProps } from '@heroui/input';
import StyledInput from '@shared/StyledInput';
import { Controller, useFormContext } from 'react-hook-form';
import { RiClipboardLine } from 'react-icons/ri';
import Label from './Label';

interface Props extends InputProps {
    name: string;
    label: string;
    placeholder: string;
    isOptional?: boolean;
    displayPasteIcon?: boolean;
    onBlur?: () => void;
    onPasteValue?: (value: string) => void;
}

export default function InputWithLabel({ name, label, placeholder, isOptional, displayPasteIcon, ...props }: Props) {
    const { control } = useFormContext();

    return (
        <div className="col w-full gap-2">
            <Label value={label} isOptional={isOptional} />

            <Controller
                name={name}
                control={control}
                render={({ field, fieldState }) => {
                    return (
                        <StyledInput
                            placeholder={placeholder}
                            value={field.value ?? ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value);
                            }}
                            onBlur={() => {
                                field.onBlur();

                                if (props.onBlur) {
                                    props.onBlur();
                                }
                            }}
                            onPaste={(e) => {
                                const pastedText = e.clipboardData?.getData('text') ?? '';

                                if (props.onPasteValue) {
                                    props.onPasteValue(pastedText);
                                }
                            }}
                            isInvalid={!!fieldState.error}
                            errorMessage={fieldState.error?.message}
                            endContent={
                                displayPasteIcon ? (
                                    <div
                                        className="cursor-pointer hover:opacity-60"
                                        onClick={async () => {
                                            try {
                                                const clipboardText = await navigator.clipboard.readText();
                                                field.onChange(clipboardText);

                                                if (props.onPasteValue) {
                                                    props.onPasteValue(clipboardText);
                                                }
                                            } catch (error) {
                                                console.error('Failed to read clipboard:', error);
                                            }
                                        }}
                                    >
                                        <RiClipboardLine className="text-lg text-slate-600" />
                                    </div>
                                ) : undefined
                            }
                            {...props}
                        />
                    );
                }}
            />
        </div>
    );
}
