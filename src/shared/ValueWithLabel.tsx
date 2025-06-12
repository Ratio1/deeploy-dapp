interface Props {
    label: string;
    value: number | string;
    useR1Prefix?: boolean;
    isAproximate?: boolean;
}

export const ValueWithLabel = ({ label, value, isAproximate, useR1Prefix }: Props) => {
    return (
        <div className="col">
            <div className="row gap-1.5">
                {!!useR1Prefix && (
                    <div className="text-[22px] font-semibold text-slate-400">{`${isAproximate ? '~' : ''}$R1`}</div>
                )}
                <div className="text-[22px] font-semibold text-primary">{value}</div>
            </div>

            <div className="text-sm text-slate-500">{label}</div>
        </div>
    );
};
