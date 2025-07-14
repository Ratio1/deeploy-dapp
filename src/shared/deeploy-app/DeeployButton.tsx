import { Button, ButtonProps } from '@heroui/button';
import clsx from 'clsx';

export default function DeeployButton({ children, className, ...props }: ButtonProps) {
    return (
        <Button className={clsx('h-[38px] rounded-[10px] px-3.5', className)} size="sm" {...props}>
            {children}
        </Button>
    );
}
