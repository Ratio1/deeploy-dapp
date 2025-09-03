import { RiArrowRightSLine } from 'react-icons/ri';

interface Props {
    expanded: boolean | undefined;
    onToggle: () => void;
}

export default function Expander({ expanded, onToggle }: Props) {
    return (
        <div
            className="-m-1 cursor-pointer rounded-md p-1 hover:bg-slate-100"
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onToggle();
            }}
        >
            <RiArrowRightSLine className={`text-[22px] text-slate-400 transition-all ${expanded ? 'rotate-90' : ''}`} />
        </div>
    );
}
