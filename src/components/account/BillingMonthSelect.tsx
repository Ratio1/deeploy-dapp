import { Select, SelectItem } from '@heroui/select';
import { Skeleton } from '@heroui/skeleton';
import { SharedSelection } from '@heroui/system';
import { useEffect, useState } from 'react';
import { RiCalendarEventLine } from 'react-icons/ri';

export default function BillingMonthSelect({
    uniqueMonths,
    onMonthChange,
}: {
    uniqueMonths: string[];
    onMonthChange: (month: string) => void;
}) {
    const [selectedMonths, setSelectedMonths] = useState<Set<string> | undefined>(undefined);

    useEffect(() => {
        if (uniqueMonths.length > 0) {
            setSelectedMonths(new Set<string>([uniqueMonths[0]]));
        }
    }, [uniqueMonths]);

    useEffect(() => {
        if (selectedMonths) {
            onMonthChange(Array.from(selectedMonths)[0]);
        }
    }, [selectedMonths]);

    if (!uniqueMonths || uniqueMonths.length === 0) {
        return null;
    }

    if (!selectedMonths) {
        return <Skeleton className="h-10 w-48 rounded-lg" />;
    }

    return (
        <Select
            className="max-w-48"
            classNames={{
                trigger: 'min-h-10 bg-slate-100 data-[hover=true]:bg-slate-150 rounded-lg shadow-none cursor-pointer',
                label: 'group-data-[filled=true]:-translate-y-5',
                value: 'font-medium text-slate-600!',
                selectorIcon: 'mt-0.5 mr-0.5',
            }}
            listboxProps={{
                itemClasses: {
                    base: [
                        'rounded-md',
                        'text-default-600',
                        'transition-opacity',
                        'data-[hover=true]:text-foreground',
                        'data-[hover=true]:bg-slate-100',
                        'data-[selectable=true]:focus:bg-slate-100',
                        'data-[pressed=true]:opacity-70',
                        'data-[focus-visible=true]:ring-default-500',
                        'px-3',
                    ],
                },
            }}
            popoverProps={{
                classNames: {
                    content: 'p-0 border-small rounded-lg',
                },
            }}
            placeholder="Select a month"
            variant="flat"
            startContent={<RiCalendarEventLine className="mt-px text-[20px] text-slate-600" />}
            selectedKeys={selectedMonths}
            onSelectionChange={(value: SharedSelection) => {
                if (value.anchorKey) {
                    setSelectedMonths(new Set<string>([value.anchorKey]));
                }
            }}
            isDisabled={uniqueMonths.length === 0}
        >
            {uniqueMonths.map((monthAndYear) => (
                <SelectItem key={monthAndYear}>
                    {new Date(monthAndYear).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </SelectItem>
            ))}
        </Select>
    );
}
