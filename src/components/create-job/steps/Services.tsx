import services from '@data/services';
import ServiceLogo from '@shared/jobs/ServiceLogo';
import clsx from 'clsx';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

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
                    onPress={() => {
                        setValue('serviceId', service.id);
                    }}
                >
                    <div className="col gap-4">
                        <div className="row gap-3">
                            <ServiceLogo filename={service.logo} name={service.name} />
                            <div className="text-base leading-none font-semibold">{service.name}</div>
                        </div>

                        <div className="compact leading-none text-slate-500">{service.description}</div>
                    </div>
                </SelectableCard>
            ))}
        </div>
    );
}
