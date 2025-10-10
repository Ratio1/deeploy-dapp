import { Skeleton } from '@heroui/skeleton';

export default function ExtendJobPageLoading() {
    return (
        <div className="col w-full gap-6">
            <div className="col gap-2">
                <Skeleton className="min-h-[219px] w-full rounded-lg" />
                <Skeleton className="min-h-[120px] w-full rounded-lg" />
                <Skeleton className="min-h-[120px] w-full rounded-lg" />
                <Skeleton className="min-h-[124px] w-full rounded-lg" />
            </div>

            <div className="row justify-end">
                <Skeleton className="min-h-[130px] w-full rounded-lg" />
            </div>
        </div>
    );
}
