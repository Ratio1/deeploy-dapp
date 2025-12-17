import { Spinner } from '@heroui/spinner';
import { ping } from '@lib/api/backend';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

function NetworkAndStatus() {
    const { data, error, isLoading } = useQuery({
        queryKey: ['ping'],
        queryFn: ping,
        retry: false,
    });
    const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? '';

    return (
        <div className="col gap-2">
            <div className="row mx-auto gap-2 rounded-lg bg-slate-200 px-3.5 py-2.5">
                <div className="center-all">
                    {isLoading ? (
                        <Spinner size="sm" className="scale-75" />
                    ) : (
                        <div
                            className={clsx('h-2.5 w-2.5 rounded-full', {
                                'bg-emerald-500': !error,
                                'bg-red-500': data?.status === 'error' || !!error,
                            })}
                        ></div>
                    )}
                </div>

                <div className="compact text-slate-600">API Status</div>
            </div>

            {!!appVersion && <div className="compact pt-1 text-center text-slate-500">v{appVersion}</div>}
        </div>
    );
}

export default NetworkAndStatus;
