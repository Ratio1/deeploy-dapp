import HeroInput from './HeroInput';

interface Props {
    label: string;
    placeholder: string;
}

export default function TextInput({ label, placeholder }: Props) {
    return (
        <div className="col w-full gap-2">
            <div className="row">
                <div className="text-sm font-medium text-slate-500">{label}</div>
            </div>

            <HeroInput placeholder={placeholder} />
        </div>
    );
}
