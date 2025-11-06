import services from '@data/services';
import { Skeleton } from '@heroui/skeleton';
import { loadServiceLogo } from '@lib/assets/serviceLogos';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

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
        <div className="center-all h-12 w-12 min-w-12 overflow-hidden rounded-xl bg-white p-2 shadow-md">
            {src === undefined ? (
                <Skeleton className="h-full w-full" />
            ) : src ? (
                <img className="max-h-7 w-full max-w-7" src={src} alt={name} />
            ) : (
                <div className="h-full w-full bg-slate-200" />
            )}
        </div>
    );
}

const SelectableCard = ({ children, isSelected, onPress }) => {
    return (
        <div
            className={clsx('bg-slate-120 cursor-pointer rounded-lg border-2 p-4 transition-all', {
                'border-transparent hover:border-slate-200': !isSelected,
                'border-primary': isSelected,
            })}
            onClick={onPress}
        >
            {children}
        </div>
    );
};

export default function Services() {
    const { watch, setValue } = useFormContext();

    const serviceId: number | undefined = watch('serviceId');

    // Init
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <div className="grid grid-cols-2 gap-3">
            {services.map((service) => (
                <SelectableCard
                    key={service.id}
                    isSelected={service.id === serviceId}
                    onPress={() => setValue('serviceId', service.id)}
                >
                    <div className="col gap-4">
                        <div className="row gap-3">
                            <ServiceLogo filename={service.logo} name={service.name} />
                            <div className="text-base leading-none font-semibold">{service.name}</div>
                        </div>

                        <div className="compact leading-none text-slate-400">{service.description}</div>
                    </div>
                </SelectableCard>
            ))}
        </div>
    );
}
