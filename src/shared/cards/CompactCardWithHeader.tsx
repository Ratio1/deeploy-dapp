import { FunctionComponent, JSX, PropsWithChildren } from 'react';

interface Props {
    header: JSX.Element;
}

export const CompactCardWithHeader: FunctionComponent<PropsWithChildren<Props>> = ({ children, header }) => {
    return (
        <div className="col overflow-hidden rounded-xl border-2 border-slate-200/65 bg-light">
            <div className="bg-slate-100 px-4 py-2">{header}</div>
            <div className="col">{children}</div>
        </div>
    );
};
