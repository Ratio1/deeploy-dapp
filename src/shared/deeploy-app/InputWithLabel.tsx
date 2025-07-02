import { InputProps } from '@heroui/input';
import HeroInput from '@shared/HeroInput';

interface Props extends InputProps {
    label: string;
    placeholder: string;
}

export default function InputWithLabel({ label, placeholder, ...props }: Props) {
    return (
        <div className="col w-full gap-2">
            <div className="row">
                <div className="text-sm font-medium text-slate-500">{label}</div>
            </div>

            <HeroInput placeholder={placeholder} {...props} />
        </div>
    );
}
