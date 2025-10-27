export default function ProfileSection({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="col w-full max-w-lg items-center gap-3.5">
            <div className="big-title">{title}</div>
            {children}
        </div>
    );
}
