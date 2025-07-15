interface Props {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export default function EmptyData({ title, description, icon }: Props) {
    return (
        <div className="col items-center gap-2">
            <div className="text-[28px] text-primary-600">{icon}</div>

            <div className="col text-center">
                <div className="font-medium text-primary-600">{title}</div>
                <div className="text-sm text-slate-500">{description}</div>
            </div>
        </div>
    );
}
