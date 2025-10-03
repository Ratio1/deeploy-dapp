export const UsdcValue = ({ value, isAproximate = false }) => {
    return (
        <div className="text-primary">
            <span className="text-slate-500">{isAproximate ? '~' : ''}$USDC</span> {value}
        </div>
    );
};
