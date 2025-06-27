interface Props {
    label: string;
    value: number | string;
    prefix?: string;
    isAproximate?: boolean;
}

export const ValueWithLabel = ({ label, value, isAproximate, prefix }: Props) => {
    return (
        <div className="col">
            <div className="row gap-1.5">
                {!!prefix && (
                    <div className="text-xl font-semibold text-slate-400">{`${isAproximate ? '~' : ''}${prefix}`}</div>
                )}

                <div className="text-xl font-semibold text-primary">{value}</div>
            </div>

            <div className="text-[15px] text-slate-500">{label}</div>
        </div>
    );
};
