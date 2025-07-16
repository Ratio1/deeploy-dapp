import { routes } from '@lib/routes/routes';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';

function FloatingNavigation() {
    const location = useLocation();

    return (
        <div className="center-all fixed bottom-0 left-0 right-0 z-40 p-4">
            <div className="center-all gap-2 rounded-full bg-slate-100 px-4 py-2 shadow-xl">
                {routes
                    .filter((route) => !!route.icon)
                    .map((route) => (
                        <div key={route.path}>
                            <Link
                                to={route.path}
                                className={clsx(
                                    'center-all cursor-pointer rounded-full p-2 text-slate-500 transition-all hover:opacity-60',
                                    {
                                        'bg-primary !text-white !opacity-100': location.pathname.includes(route.path),
                                    },
                                )}
                            >
                                <div className="text-2xl">{route.icon}</div>
                            </Link>
                        </div>
                    ))}
            </div>

            {/* <div className="center-all gap-2 rounded-full bg-primary px-4 py-2 shadow-xl">
                {routes
                    .filter((route) => !!route.icon)
                    .map((route) => (
                        <div key={route.path}>
                            <Link
                                to={route.path}
                                className={clsx('center-all cursor-pointer rounded-full p-2 text-white/60', {
                                    'bg-white !text-primary': location.pathname.includes(route.path),
                                })}
                            >
                                <div className="text-2xl">{route.icon}</div>
                            </Link>
                        </div>
                    ))}
            </div> */}
        </div>
    );
}

export default FloatingNavigation;
