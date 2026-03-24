import { RunningJobWithDetails } from '@typedefs/deeploys';
import { StackComponent, StackDraft, StackRuntimeStatus } from '@typedefs/stacks';

export type StackComponentRuntimeStatus = 'draft' | 'deploying' | 'running' | 'failed';

export type StackComponentRuntimeView = {
    component: StackComponent;
    status: StackComponentRuntimeStatus;
    runningJob?: RunningJobWithDetails;
};

const isJobRunning = (job: RunningJobWithDetails): boolean => {
    if (!job.instances?.length) {
        return false;
    }

    return job.instances.some((instance) => instance.isOnline !== false);
};

const findComponentRunningJob = (
    stack: StackDraft,
    component: StackComponent,
    runningJobs: RunningJobWithDetails[],
): RunningJobWithDetails | undefined => {
    return runningJobs.find((job) => {
        const cfg = job.config ?? {};
        const stackId = String((cfg as Record<string, unknown>).stack_id ?? '');
        const stackComponentName = String((cfg as Record<string, unknown>).stack_component_name ?? '');
        const stackServiceName = String((cfg as Record<string, unknown>).stack_service_name ?? '');

        if (stackId !== stack.id) {
            return false;
        }

        return (
            stackComponentName.toLowerCase() === component.name.toLowerCase() ||
            stackServiceName.toLowerCase() === component.serviceName.toLowerCase()
        );
    });
};

export const getStackRuntimeView = (
    stack: StackDraft,
    runningJobs: RunningJobWithDetails[] = [],
): {
    status: StackRuntimeStatus;
    components: StackComponentRuntimeView[];
} => {
    const componentViews: StackComponentRuntimeView[] = stack.components.map((component) => {
        const runningJob = findComponentRunningJob(stack, component, runningJobs);

        if (!runningJob) {
            const deployedState = stack.componentState?.find((state) => state.componentId === component.id);
            if (deployedState?.runningJobId) {
                return {
                    component,
                    status: 'deploying',
                };
            }

            return {
                component,
                status: 'draft',
            };
        }

        return {
            component,
            status: isJobRunning(runningJob) ? 'running' : 'failed',
            runningJob,
        };
    });

    if (componentViews.every((view) => view.status === 'draft')) {
        return {
            status: 'draft',
            components: componentViews,
        };
    }

    const runningCount = componentViews.filter((view) => view.status === 'running').length;
    const failedCount = componentViews.filter((view) => view.status === 'failed').length;
    const deployingCount = componentViews.filter((view) => view.status === 'deploying').length;

    if (failedCount > 0 && runningCount === 0) {
        return {
            status: 'failed',
            components: componentViews,
        };
    }

    if (runningCount === componentViews.length) {
        return {
            status: 'running',
            components: componentViews,
        };
    }

    if (runningCount > 0) {
        return {
            status: 'partially running',
            components: componentViews,
        };
    }

    if (deployingCount > 0) {
        return {
            status: 'deploying',
            components: componentViews,
        };
    }

    return {
        status: 'failed',
        components: componentViews,
    };
};
