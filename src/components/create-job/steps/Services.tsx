import services from '@data/services';
import { Skeleton } from '@heroui/skeleton';
import { loadServiceLogo } from '@lib/assets/serviceLogos';
import { SlateCard } from '@shared/cards/SlateCard';
import { useEffect, useState } from 'react';

function ServiceLogo({ filename, name }: { filename: string; name: string }) {
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
        <div className="center-all h-12 w-12 overflow-hidden rounded-xl bg-white p-2 shadow-md">
            {src === undefined ? (
                <Skeleton className="h-full w-full" />
            ) : src ? (
                <img className="max-h-7 max-w-7" src={src} alt={name} />
            ) : (
                <div className="h-full w-full bg-slate-200" />
            )}
        </div>
    );
}

export default function Services() {
    // Init
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <div className="grid grid-cols-2 gap-4">
            {services.map((service, index) => (
                <SlateCard key={index}>
                    <div className="row gap-3.5">
                        <ServiceLogo filename={service.logo} name={service.name} />

                        <div className="col gap-1.5">
                            <div className="text-base leading-none font-medium">{service.name}</div>
                            <div className="compact leading-none text-slate-400">{service.description}</div>
                        </div>
                    </div>
                </SlateCard>
            ))}
        </div>
    );
}
