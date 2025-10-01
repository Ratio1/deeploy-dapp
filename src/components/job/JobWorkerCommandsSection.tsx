import { SmallTag } from '@shared/SmallTag';

export default function JobWorkerCommandsSection({ commands }: { commands: string[] }) {
    return (
        <div className="col mt-1 gap-1">
            {commands.map((command, index) => (
                <SmallTag key={index} isLarge>
                    <div className="row font-roboto-mono gap-1.5">
                        <div className="text-slate-400">COMMAND</div>
                        <div>{command}</div>
                    </div>
                </SmallTag>
            ))}
        </div>
    );
}
