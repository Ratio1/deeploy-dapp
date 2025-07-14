import ApplicationCard from '@components/deeploys/ApplicationCard';
import EmptyData from '@shared/EmptyData';
import ListHeader from '@shared/ListHeader';
import { DeeployApp } from '@typedefs/general';
import { RiDraftLine } from 'react-icons/ri';

const running: DeeployApp[] = [
    {
        alias: 'native_app_x',
        pluginSignature: 'CONTAINER_APP_RUNNER',
        nodes: 3,
        processor: 'GPU',
        runningNodes: '2/3',
        deadline: '2026-12-25',
    },
    {
        alias: 'some_app_name_05',
        pluginSignature: 'SOME_PLUGIN_01',
        nodes: 4,
        processor: 'GPU',
        runningNodes: '4/4',
        deadline: '2027-02-14',
    },
    {
        alias: 'service_pubapi_etc',
        pluginSignature: 'CONTAINER_APP_RUNNER',
        nodes: 1,
        processor: 'CPU',
        runningNodes: '1/1',
        deadline: '2026-11-30',
    },
];

function Running() {
    return (
        <div className="list">
            <ListHeader>
                <div className="min-w-[212px]">Alias</div>
                <div className="min-w-[212px]">Plugin Signature</div>
                <div className="min-w-[64px]">Nodes</div>
                <div className="min-w-[82px]">GPU/CPU</div>
                <div className="min-w-[112px]">Running Nodes</div>
                <div className="min-w-[112px]">Deadline</div>
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
