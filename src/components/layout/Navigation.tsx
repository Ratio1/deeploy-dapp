'use client';

import { AppRoute, isParentRoute, routeInfo, routes } from '@lib/routes/routes';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Navigation() {
    return (
        <div className="flex w-full flex-col gap-2.5">
            {routes
                .filter((route) => !!route.icon)
                .map((route, index) => (
                    <Route key={index} route={route} />
                ))}
        </div>
    );
}

function Route({ route }: { route: AppRoute }) {
    const pathname = usePathname() ?? '';

    return (
        <div className="col gap-1">
            <Link
                href={route.path}
                className={clsx('min-w-40 cursor-pointer rounded-lg px-3 py-2.5 text-body transition-all hover:bg-[#dbecff]', {
                    'bg-[#dbecff] text-primary!': pathname.includes(route.path),
                })}
            >
                <div className="row gap-2.5">
                    <div className="text-[22px]">{route.icon}</div>
                    <div className="text-[15px] font-medium">
                        {routeInfo[route.path]?.routeTitle || routeInfo[route.path].title}
                    </div>
                </div>
            </Link>

            {isParentRoute(route) && (
                <div className="ml-[22.5px] flex flex-col border-l-2 border-gray-200 pl-5">
                    {route.children.map((child) => (
                        <Link
                            key={child.path}
                            href={`${route.path}/${child.path}`}
                            className={clsx(
                                'cursor-pointer py-1 text-[15px] font-medium text-slate-700 transition-all hover:opacity-60',
                                {
                                    'text-primary! hover:opacity-100!':
                                        pathname.includes(route.path) && pathname.includes(child.path),
                                },
                            )}
                        >
                            {routeInfo[`${route.path}/${child.path}`]?.routeTitle ||
                                routeInfo[`${route.path}/${child.path}`]?.title}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Navigation;
