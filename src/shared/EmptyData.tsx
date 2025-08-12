interface Props {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export default function EmptyData({ title, description, icon }: Props) {
    return (
        <div className="col items-center gap-2">
            <div className="text-primary-600 text-[28px]">{icon}</div>

            <div className="col text-center">
                <div className="text-primary-600 font-medium">{title}</div>
                <div className="text-sm text-slate-500">{description}</div>
            </div>
        </div>
    );
}
