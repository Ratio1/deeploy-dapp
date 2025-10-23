import { InputProps } from '@heroui/input';
import StyledInput from '@shared/StyledInput';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { RiCheckLine, RiClipboardLine, RiFileCopyLine } from 'react-icons/ri';
import Label from './Label';
import SecretValueToggle from './jobs/SecretValueToggle';

interface Props extends InputProps {
    name: string;
    label: string;
    placeholder: string;
    isOptional?: boolean;
    onBlur?: () => void;
    onPasteValue?: (value: string) => void;
    customLabel?: React.ReactNode;
    endContent?: 'copy' | 'paste';
    hasSecretValue?: boolean;
}

export default function InputWithLabel({
    name,
    label,
    placeholder,
    isOptional,
    customLabel,
    endContent,
    hasSecretValue,
    ...props
}: Props) {
    const { control } = useFormContext();

    const [copied, setCopied] = useState(false);
    const [isFieldSecret, setFieldSecret] = useState(!!hasSecretValue);

    return (
        <div className="col w-full gap-2">
            {customLabel ? customLabel : <Label value={label} isOptional={isOptional} />}

            <div className="flex gap-3">
                {hasSecretValue && (
                    <SecretValueToggle
                        isSecret={isFieldSecret}
                        onClick={() => {
                            setFieldSecret((previous) => !previous);
                        }}
                    />
                )}

                <Controller
                    name={name}
                    control={control}
                    render={({ field, fieldState }) => {
                        if (name === 'deployment.deploymentType.crUsername') {
                            console.log({ field, fieldState });
                        }

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
                                    endContent === 'paste' ? (
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
                                    ) : endContent === 'copy' ? (
                                        <div
                                            className="cursor-pointer text-lg text-slate-600 hover:opacity-60"
                                            onClick={async () => {
                                                try {
                                                    if (copied) {
                                                        return;
                                                    }

                                                    navigator.clipboard.writeText(field.value);
                                                    setCopied(true);
                                                    setTimeout(() => {
                                                        setCopied(false);
                                                    }, 1000);
                                                } catch (error) {
                                                    console.error('Failed to copy to clipboard:', error);
                                                }
                                            }}
                                        >
                                            {copied ? <RiCheckLine /> : <RiFileCopyLine />}
                                        </div>
                                    ) : undefined
                                }
                                type={isFieldSecret ? 'password' : 'text'}
                                {...props}
                            />
                        );
                    }}
                />
            </div>
        </div>
    );
}
