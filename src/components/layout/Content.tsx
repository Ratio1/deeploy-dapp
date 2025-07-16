import { routeInfo } from '@lib/routes/routes';
import { ConnectKitButton } from 'connectkit';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

function Content() {
    const [title, setTitle] = useState<string>();
    const [description, setDescription] = useState<string>();

    const location = useLocation();

    useEffect(() => {
        // Exclude the root route
        if (location.pathname.length > 1) {
            // Sort keys first in order to prioritize child routes which are longer
            const path = Object.keys(routeInfo)
                .sort((a, b) => b.length - a.length)
                .find((p) => location.pathname.startsWith(p));

            if (path) {
                setTitle(routeInfo[path]?.title);
                setDescription(routeInfo[path]?.description);
            }
        }
    }, [location]);

    return (
        <div className="col mx-auto h-full max-w-6xl gap-6 px-4 md:gap-8 md:px-8 lg:gap-12 lg:px-10">
            <div className="flex flex-col-reverse items-center justify-between gap-8 lg:flex-row lg:items-start lg:gap-8">
                <div className="col gap-1.5">
                    {!!title && (
                        <div className="row justify-center lg:justify-start">
                            <div className="text-[26px] font-bold leading-none lg:text-[28px]">{title}</div>
                        </div>
                    )}

                    {!!description && (
                        <div className="text-center text-base text-slate-500 lg:text-left lg:text-lg">{description}</div>
                    )}
                </div>

                <div className="flex">
                    <ConnectKitButton showBalance />
                </div>
            </div>

            <Outlet />
        </div>
    );
}

export default Content;
