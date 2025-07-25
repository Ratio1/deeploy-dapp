import Label from './Label';
import StyledInput from './StyledInput';

interface Props {
    label: string;
    placeholder: string;
}

export default function TextInput({ label, placeholder }: Props) {
    return (
        <div className="col w-full gap-2">
            <div className="row">
                <Label value={label} />
            </div>

            <StyledInput placeholder={placeholder} />
        </div>
    );
}
