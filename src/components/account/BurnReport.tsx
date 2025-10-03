import { DateRangePicker } from '@heroui/date-picker';
import { parseDate, today } from '@internationalized/date';
import { formatISO, subMonths } from 'date-fns';
import { useEffect, useState } from 'react';
import { RiCalendarEventLine } from 'react-icons/ri';
export default function BurnReport() {
    const [value, setValue] = useState({
        start: parseDate(formatISO(subMonths(new Date(), 1), { representation: 'date' })),
        end: today('UTC'),
    });

    useEffect(() => {
        console.log(value);
    }, [value]);

    return (
        <div className="flex max-w-sm">
            <DateRangePicker
                aria-label="Select interval"
                classNames={{
                    inputWrapper: 'rounded-lg bg-slate-100 hover:bg-slate-150 focus-within:hover:bg-slate-150 shadow-none',
                }}
                label="Select interval"
                selectorIcon={<RiCalendarEventLine className="text-xl" />}
                visibleMonths={2}
                value={value}
                onChange={(value) => {
                    if (value) {
                        setValue(value);
                    }
                }}
                calendarProps={{
                    classNames: {
                        cell: 'cursor-pointer',
                    },
                }}
            />
        </div>
    );
}
