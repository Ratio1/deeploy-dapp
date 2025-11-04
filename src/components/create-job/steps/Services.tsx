import services from '@data/services';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { useEffect } from 'react';

export default function Services() {
    // Init
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <div className="grid grid-cols-2 gap-4">
            {services.map((service, index) => (
                <BorderedCard key={index} disableWrapper>
                    <div className="col gap-4 p-6">
                        <div className="center-all rounded-2xl bg-white p-3 shadow-sm">
                            <img src={`/assets/services/${service.logo}`} alt={service.name} width={32} height={32} />
                        </div>

                        <div className="col gap-1">
                            <div className="text-base leading-none font-medium">{service.name}</div>
                            <div className="text-sm text-slate-600">{service.description}</div>
                        </div>
                    </div>
                </BorderedCard>
            ))}
        </div>
    );
}
