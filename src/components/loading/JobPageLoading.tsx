import { Skeleton } from '@heroui/skeleton';

export default function JobPageLoading() {
    return (
        <div className="col w-full gap-6">
            <div className="row justify-between">
                <Skeleton className="min-h-[38px] w-96 rounded-lg" />
                <Skeleton className="min-h-[38px] w-64 rounded-lg" />
            </div>

            <Skeleton className="min-h-[80px] w-full rounded-lg" />
            <Skeleton className="min-h-[138px] w-full rounded-lg" />
            <Skeleton className="min-h-[116px] w-full rounded-lg" />
            <Skeleton className="min-h-[356px] w-full rounded-lg" />
            <Skeleton className="min-h-[162px] w-full rounded-lg" />
        </div>
    );
}
