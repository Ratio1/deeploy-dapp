import { Skeleton } from '@heroui/skeleton';

export default function JobPageLoading() {
    return (
        <div className="col w-full gap-6">
            <div className="row justify-between">
                <Skeleton className="min-h-[38px] w-[420px] rounded-lg" />
                <Skeleton className="min-h-[38px] w-[362px] rounded-lg" />
            </div>

            <Skeleton className="min-h-[120px] w-full rounded-lg" />
            <Skeleton className="min-h-[138px] w-full rounded-lg" />
            <Skeleton className="min-h-[116px] w-full rounded-lg" />
            <Skeleton className="min-h-[456px] w-full rounded-lg" />
            <Skeleton className="min-h-[190px] w-full rounded-lg" />
        </div>
    );
}
