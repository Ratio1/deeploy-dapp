'use client';

import { routeInfo } from '@lib/routes/routes';
import { ConnectKitButton } from 'connectkit';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function Content({ children }: { children: React.ReactNode }) {
    const [title, setTitle] = useState<string>();
    const [description, setDescription] = useState<string>();

    const pathname = usePathname() ?? '';

    useEffect(() => {
        if (pathname.length > 1) {
            const path = Object.keys(routeInfo)
                .sort((a, b) => b.length - a.length)
                .find((p) => pathname.startsWith(p));

            if (path) {
                setTitle(routeInfo[path]?.title);
                setDescription(routeInfo[path]?.description);
            }
        }
    }, [pathname]);

    return (
        <div className="col mx-auto h-full max-w-6xl gap-8 px-6 lg:gap-12 xl:px-10">
            <div className="flex justify-between gap-8 lg:gap-8">
                <div className="col gap-1.5">
                    {!!title && (
                        <div className="row">
                            <div className="text-[26px] leading-none font-bold lg:text-[28px]">{title}</div>
                        </div>
                    )}

                    {!!description && <div className="text-base text-slate-500 lg:text-[17px]">{description}</div>}
                </div>

                <div className="flex">
                    <ConnectKitButton />
                </div>
            </div>

            {children}
        </div>
    );
}

export default Content;
