import services from '@data/services';
import { Skeleton } from '@heroui/skeleton';
import { loadServiceLogo } from '@lib/assets/serviceLogos';
import clsx from 'clsx';
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

const SelectableCard = ({ children, isSelected, onPress }) => {
    return (
        <div
            className={clsx('cursor-pointer rounded-lg border-2 bg-slate-100 p-4 transition-all', {
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
    const [selectedIndex, setSelectedIndex] = useState<number | undefined>();

    // Init
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <div className="grid grid-cols-2 gap-3">
            {services.map((service, index) => (
                <SelectableCard key={index} isSelected={selectedIndex === index} onPress={() => setSelectedIndex(index)}>
                    <div className="row gap-3.5">
                        <ServiceLogo filename={service.logo} name={service.name} />

                        <div className="col gap-1.5">
                            <div className="text-base leading-none font-medium">{service.name}</div>
                            <div className="compact leading-none text-slate-400">{service.description}</div>
                        </div>
                    </div>
                </SelectableCard>
            ))}
        </div>
    );
}
