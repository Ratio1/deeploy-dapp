import { AppRoute, mainRoutesInfo, routes } from '@lib/routes/routes';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';

function Navigation() {
    return (
        <div className="flex w-full flex-col gap-2">
            {routes
                .filter((route) => !!route.icon)
                .map((route, index) => (
                    <div key={index}>
                        <Route route={route} />
                    </div>
                ))}
        </div>
    );
}

function Route({ route }: { route: AppRoute }) {
    const location = useLocation();

    return (
        <div className="col gap-2">
            <Link
                to={route.path}
                className={clsx('min-w-40 cursor-pointer rounded-lg px-3 py-2.5 text-body transition-all hover:bg-[#dbecff]', {
                    'bg-[#dbecff] !text-primary': location.pathname.includes(route.path),
                })}
            >
                <div className="row gap-2.5">
                    <div className="text-[22px]">{route.icon}</div>
                    <div className="text-[15px] font-medium"> {mainRoutesInfo[route.path].title}</div>
                </div>
            </Link>
        </div>
    );
}

export default Navigation;
