import { Button } from '@heroui/button';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import clsx from 'clsx';
import { HiOutlineRefresh } from 'react-icons/hi';

export default function RefreshRequiredAlert({
    customCallback,
    isCompact,
}: {
    customCallback?: () => void;
    isCompact?: boolean;
}) {
    const { isFetchingApps, isFetchAppsRequired, fetchApps } = useDeploymentContext() as DeploymentContextType;

    if (!isFetchAppsRequired) {
        return null;
    }

    return (
        <div
            className={clsx('text-warning-800 bg-warning-100 rounded-lg py-3 text-sm', {
                'px-6': !isCompact,
                'px-4': isCompact,
            })}
        >
            <div className="row justify-between gap-4">
                <div className="row gap-2.5">
                    <HiOutlineRefresh className="text-xl" />

                    <div className="col gap-1">
                        <div className="leading-none font-medium">Refresh required</div>
                        <div className="text-[13px] leading-none">
                            Your running jobs have been updated, please refresh to fetch the latest changes.
                        </div>
                    </div>
                </div>

                <div>
                    <Button
                        className="bg-warning-300 rounded-md"
                        color="warning"
                        size="sm"
                        onPress={() => {
                            if (customCallback) {
                                customCallback();
                            } else {
                                fetchApps();
                            }
                        }}
                        isLoading={isFetchingApps}
                    >
                        <div className="text-[13px]">Refresh</div>
                    </Button>
                </div>
            </div>
        </div>
    );
}
