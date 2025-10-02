import { Skeleton } from '@heroui/skeleton';

export default function EditJobPageLoading() {
    return (
        <div className="col w-full gap-6">
            <Skeleton className="min-h-[141px] w-full rounded-lg" />
            <Skeleton className="min-h-[149px] w-full rounded-lg" />
            <Skeleton className="min-h-[141px] w-full rounded-lg" />
            <Skeleton className="min-h-[202px] w-full rounded-lg" />
            <Skeleton className="min-h-[129px] w-full rounded-lg" />
            <Skeleton className="min-h-[141px] w-full rounded-lg" />
            <Skeleton className="min-h-[141px] w-full rounded-lg" />
        </div>
    );
}
