import { Button } from '@heroui/button';
import { DateRangePicker } from '@heroui/date-picker';
import { CalendarDate, parseDate, today } from '@internationalized/date';
import { downloadBurnReportCSV, downloadBurnReportJSON } from '@lib/api/backend';
import { padNumber } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { formatISO, subMonths } from 'date-fns';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { LuFileJson, LuFileSpreadsheet } from 'react-icons/lu';
import { RiCalendarEventLine } from 'react-icons/ri';

export default function BurnReport() {
    const [value, setValue] = useState<{
        start: CalendarDate;
        end: CalendarDate;
    }>({
        start: parseDate(formatISO(subMonths(new Date(), 1), { representation: 'date' })),
        end: today('UTC'),
    });

    const [isLoading, setLoading] = useState<boolean>(false);

    const onDownloadCSV = async () => {
        try {
            setLoading(true);

            const start = `${padNumber(value.start.day, 2)}-${padNumber(value.start.month, 2)}-${value.start.year}`;
            const end = `${padNumber(value.end.day, 2)}-${padNumber(value.end.month, 2)}-${value.end.year}`;

            const report = await downloadBurnReportCSV(start, end);
            console.log(report);
        } catch (error) {
            console.error(error);
            toast.error('Failed to download burn report.');
        } finally {
            setLoading(false);
        }
    };

    const onDownloadJSON = async () => {
        try {
            setLoading(true);

            const start = `${padNumber(value.start.day, 2)}-${padNumber(value.start.month, 2)}-${value.start.year}`;
            const end = `${padNumber(value.end.day, 2)}-${padNumber(value.end.month, 2)}-${value.end.year}`;

            const report = await downloadBurnReportJSON(start, end);
            console.log(report);
        } catch (error) {
            console.error(error);
            toast.error('Failed to download burn report.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="center-all">
            <div className="flex">
                <BorderedCard>
                    <div className="col items-center gap-5 py-2">
                        <div className="text-lg font-semibold">Generate Burn Report</div>

                        <div className="flex min-w-xs">
                            <DateRangePicker
                                aria-label="Select interval"
                                classNames={{
                                    inputWrapper:
                                        'rounded-lg bg-slate-100 hover:bg-slate-150 focus-within:hover:bg-slate-150 shadow-none',
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
                                isDisabled={isLoading}
                            />
                        </div>

                        <div className="center-all gap-1.5">
                            <Button color="primary" onPress={onDownloadCSV} isLoading={isLoading}>
                                <div className="row gap-1.5">
                                    <LuFileSpreadsheet className="text-lg" />
                                    <div className="text-sm">Download CSV</div>
                                </div>
                            </Button>

                            <Button color="primary" onPress={onDownloadJSON} isLoading={isLoading}>
                                <div className="row gap-1.5">
                                    <LuFileJson className="text-lg" />
                                    <div className="text-sm">Download JSON</div>
                                </div>
                            </Button>
                        </div>
                    </div>
                </BorderedCard>
            </div>
        </div>
    );
}
