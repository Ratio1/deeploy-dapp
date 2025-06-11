import { JSX } from 'react';

export const CardItem = ({ label, value }: { label: JSX.Element | string; value: JSX.Element | string | bigint | number }) => {
    return (
        <div className="col text-sm font-medium">
            <div className="block leading-5 lg:hidden">{label}</div>
            <div className="leading-5 text-slate-400 lg:text-body">{value}</div>
        </div>
    );
};
