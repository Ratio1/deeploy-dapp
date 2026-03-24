'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import { RiInformationLine } from 'react-icons/ri';

export default function FieldHelpPopover({ content }: { content: React.ReactNode }) {
    return (
        <Popover placement="top" offset={10}>
            <PopoverTrigger>
                <button
                    type="button"
                    className="text-slate-400 transition-colors hover:text-slate-700"
                    aria-label="Show help"
                >
                    <RiInformationLine className="text-[16px]" />
                </button>
            </PopoverTrigger>

            <PopoverContent className="max-w-[280px] p-3 text-sm text-slate-700">
                <div>{content}</div>
            </PopoverContent>
        </Popover>
    );
}
