import { formatUsdc, getJobCost } from '@lib/deeploy-utils';
import CardWithItems from '@shared/jobs/projects/CardWithItems';
import { UsdcValue } from '@shared/UsdcValue';
import { DraftJob } from '@typedefs/deeploys';

export default function DraftStats({ jobs }: { jobs: DraftJob[] | undefined }) {
    if (!jobs || jobs.length === 0) {
        return null;
    }

    const getJobMonthlyCost = (job: DraftJob) => getJobCost(job) / BigInt(job.costAndDuration.paymentMonthsCount || 1);

    const monthlyCostEstimate = jobs.reduce((acc, job) => acc + getJobMonthlyCost(job), 0n);

    const items = [
        {
            label: 'Total Job Drafts',
            value: jobs.length,
        },
        {
            label: 'Total Target Nodes',
            value: jobs.reduce((acc, job) => acc + job.specifications.targetNodesCount, 0),
        },
        {
            label: 'Monthly Cost',
            value: <UsdcValue value={formatUsdc(monthlyCostEstimate)} isAproximate />,
        },
    ];

    return <CardWithItems items={items} />;
}
