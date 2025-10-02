import { config } from '@lib/config';
import { addTimeFn, diffTimeFn } from '@lib/deeploy-utils';
import CardWithItems from '@shared/jobs/projects/CardWithItems';
import DetailedUsage from '@shared/projects/DetailedUsage';
import { RunningJobWithResources } from '@typedefs/deeploys';

export default function JobFullUsage({ job }: { job: RunningJobWithResources }) {
    const requestDate = new Date(Number(job.requestTimestamp) * 1000);
    const expirationDate = addTimeFn(config.genesisDate, Number(job.lastExecutionEpoch));

    const lifespan = diffTimeFn(expirationDate, requestDate) + 1;
    const elapsed = diffTimeFn(new Date(), requestDate);
    const paid = diffTimeFn(expirationDate, requestDate) + 1;
    const unpaid = lifespan - paid;

    const items = [
        {
            label: 'Lifespan',
            value: `${lifespan} epochs`,
        },
        {
            label: 'Elapsed',
            value: `${elapsed} epochs`,
        },
        {
            label: 'Payment Covered',
            value: paid - elapsed > 0 ? `${paid - elapsed} epochs` : '—',
        },
        {
            label: 'Unpaid',
            value: unpaid > 0 ? `${unpaid} epochs` : '—',
        },
    ];

    return (
        <CardWithItems
            items={items}
            header={<div className="text-lg font-semibold">Usage</div>}
            footer={<DetailedUsage size="medium" used={elapsed} paid={paid} total={lifespan} disableLabels />}
        />
    );
}
