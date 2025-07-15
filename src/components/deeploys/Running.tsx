import ApplicationCard from '@components/deeploys/ApplicationCard';
import EmptyData from '@shared/EmptyData';
import ListHeader from '@shared/ListHeader';
import { DeeployApp } from '@typedefs/general';
import { RiDraftLine } from 'react-icons/ri';

const running: DeeployApp[] = [
    {
        alias: 'postgres_service',
        pluginSignature: 'DB_RUNNER_1',
        nodes: 1,
        processor: 'CPU',
        runningNodes: '1/1',
        expiresAt: '2026-11-30',
    },
];

function Running() {
    return (
        <div className="list">
            <ListHeader>
                <div className="min-w-[212px]">Alias</div>
                <div className="min-w-[212px]">Plugin Signature</div>
                <div className="min-w-[92px]">Nodes</div>
                <div className="min-w-[92px]">GPU/CPU</div>
                <div className="min-w-[112px]">Running Nodes</div>
                <div className="min-w-[112px]">Expiration Date</div>
            </ListHeader>

            {running.map((app, index) => (
                <div key={index}>
                    <ApplicationCard app={app} />
                </div>
            ))}

            {!running?.length && (
                <div className="center-all w-full p-14">
                    <EmptyData
                        title="No running apps"
                        description="Deployed apps will be displayed here."
                        icon={<RiDraftLine />}
                    />
                </div>
            )}
        </div>
    );
}

export default Running;
