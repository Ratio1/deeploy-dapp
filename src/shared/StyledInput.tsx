import { Input, InputProps } from '@heroui/input';
import { useEffect, useRef } from 'react';

interface Props extends InputProps {
    showsWarning?: boolean;
}

export default function StyledInput({ showsWarning, ...props }: Props) {
    const ref = useRef<HTMLInputElement>(null);

    // Disable mouse wheel changing number input
    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            if (document.activeElement === el) {
                e.preventDefault();
            }
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, []);

    return (
        <Input
            ref={ref}
            className="w-full"
            size="md"
            classNames={{
                inputWrapper: `rounded-lg bg-light shadow-none transition-shadow! border data-[hover=true]:border-slate-300 group-data-[focus=true]:border-slate-400! group-data-[focus=true]:shadow-custom ${
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
