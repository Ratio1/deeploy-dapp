import { Skeleton } from '@heroui/skeleton';
import { loadServiceLogo } from '@lib/assets/serviceLogos';
import { useEffect, useState } from 'react';

export default function ServiceLogo({ filename, name }: { filename: string; name: string }) {
    const [src, setSrc] = useState<string | null | undefined>(undefined);

    useEffect(() => {
        let isMounted = true;

        loadServiceLogo(filename).then((logoUrl) => {
            if (isMounted) {
                setSrc(logoUrl ?? null);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [filename]);

    return (
        <div className="center-all h-12 w-12 min-w-12 overflow-hidden rounded-xl bg-white p-2 shadow-md">
            {src === undefined ? (
                <Skeleton className="h-full w-full rounded-lg" />
            ) : src ? (
                <img className="max-h-7 w-full max-w-7" src={src} alt={name} />
            ) : (
                <div className="h-full w-full rounded-lg bg-slate-200" />
            )}
        </div>
    );
}
