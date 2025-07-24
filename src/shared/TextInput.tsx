import StyledInput from './StyledInput';

interface Props {
    label: string;
    placeholder: string;
}

export default function TextInput({ label, placeholder }: Props) {
    return (
        <div className="col w-full gap-2">
            <div className="row">
                <div className="compact text-slate-500">{label}</div>
            </div>

            <StyledInput placeholder={placeholder} />
        </div>
    );
}
