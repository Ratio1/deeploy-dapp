import { Skeleton } from '@heroui/skeleton';

export default function JobPageLoading() {
    return (
        <div className="col w-full gap-6">
            <div className="row justify-between">
                <Skeleton className="min-h-[38px] w-80 rounded-lg" />
                <Skeleton className="min-h-[38px] w-80 rounded-lg" />
            </div>

            <Skeleton className="min-h-[86.5px] w-full rounded-lg" />
            <Skeleton className="min-h-[108.5px] w-full rounded-lg" />
            <Skeleton className="min-h-[86.5px] w-full rounded-lg" />
            <Skeleton className="min-h-[169px] w-full rounded-lg" />
        </div>
    );
}
