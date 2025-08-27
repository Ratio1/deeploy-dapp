import { Skeleton } from '@heroui/skeleton';

export default function JobPageLoading() {
    return (
        <div className="col w-full gap-6">
            <div className="row justify-between">
                <Skeleton className="min-h-12 w-80 rounded-lg" />
                <Skeleton className="min-h-12 w-80 rounded-lg" />
            </div>

            <Skeleton className="min-h-[300px] w-full rounded-lg" />
            <Skeleton className="min-h-[300px] w-full rounded-lg" />
        </div>
    );
}
