import { Button, ButtonProps } from '@heroui/button';
import clsx from 'clsx';

type ActionButtonProps = ButtonProps & {
    to?: string; // Not included in ButtonProps for some reason
};

export default function ActionButton({ children, className, ...props }: ActionButtonProps) {
    return (
        <Button className={clsx('h-[38px] rounded-[10px] px-3.5', className)} size="sm" {...props}>
            {children}
        </Button>
    );
}
