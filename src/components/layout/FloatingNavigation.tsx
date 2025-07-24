import { Button } from '@heroui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import { routePath } from '@lib/routes/route-paths';
import { isParentRoute, routeInfo, routes } from '@lib/routes/routes';
import clsx from 'clsx';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function FloatingNavigation() {
    const location = useLocation();
    const [isPopoverOpen, setPopoverOpen] = useState(false);

    const baseClasses = 'center-all cursor-pointer rounded-full p-2 transition-all';

    return (
        <div className="center-all fixed bottom-0 left-0 right-0 z-40 p-4">
            <div className="center-all relative gap-2.5 rounded-full bg-slate-100 px-4 py-2 shadow-xl">
                {routes
                    .filter((route) => !!route.icon)
                    .map((route) => (
                        <div key={route.path}>
                            {route.path === routePath.deeploys && isParentRoute(route) ? (
                                <Popover
                                    isOpen={isPopoverOpen}
                                    onOpenChange={(open) => setPopoverOpen(open)}
                                    color="primary"
                                    placement="top"
                                    offset={14}
                                    shouldCloseOnBlur={true}
                                >
                                    <PopoverTrigger>
                                        <Button className="min-w-10 rounded-full px-0" color="primary" variant="solid">
                                            <div className="text-2xl">{route.icon}</div>
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="rounded-xl">
                                        <div className="col gap-1.5 px-0 py-1.5">
                                            {route.children.map((child) => (
                                                <Link
                                                    key={child.path}
                                                    to={`${route.path}/${child.path}`}
                                                    onClick={() => setPopoverOpen(false)}
                                                >
                                                    <div className="rounded-md bg-white/20 px-3 py-2 text-[15px] transition-all hover:opacity-70">
                                                        {routeInfo[`${route.path}/${child.path}`]?.routeTitle ||
                                                            routeInfo[`${route.path}/${child.path}`].title}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            ) : (
                                <Link
                                    to={route.path}
                                    className={clsx(`${baseClasses} text-slate-500 hover:opacity-60`, {
                                        'text-primary! opacity-100!': location.pathname.includes(route.path),
                                    })}
                                >
                                    <div className="text-2xl">{route.icon}</div>
                                </Link>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default FloatingNavigation;
