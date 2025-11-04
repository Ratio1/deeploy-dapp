import CostAndDuration from '@components/create-job/steps/CostAndDuration';
import Deployment from '@components/create-job/steps/Deployment';
import Plugins from '@components/create-job/steps/Plugins';
import Services from '@components/create-job/steps/Services';
import Specifications from '@components/create-job/steps/Specifications';
import ReviewAndConfirm from '@components/edit-job/ReviewAndConfirm';

export enum Step {
    // Main
    SPECIFICATIONS = 'specifications',
    COST_AND_DURATION = 'costAndDuration',
    DEPLOYMENT = 'deployment',

    // Other
    SERVICES = 'services',
    PLUGINS = 'plugins',
    REVIEW_AND_CONFIRM = 'reviewAndConfirm',
}

export const STEPS: Record<
    Step,
    {
        title: string;
        validationName?: string;
        component: React.ComponentType<any>;
    }
> = {
    [Step.SPECIFICATIONS]: {
        title: 'Specifications',
        validationName: 'specifications',
        component: Specifications,
    },
    [Step.COST_AND_DURATION]: {
        title: 'Cost & Duration',
        validationName: 'costAndDuration',
        component: CostAndDuration,
    },
    [Step.DEPLOYMENT]: {
        title: 'Deployment',
        validationName: 'deployment',
        component: Deployment,
    },
    [Step.SERVICES]: {
        title: 'Services',
        validationName: 'services',
        component: Services,
    },
    [Step.PLUGINS]: {
        title: 'Plugins',
        validationName: 'plugins',
        component: Plugins,
    },
    [Step.REVIEW_AND_CONFIRM]: {
        title: 'Review & Confirm',
        component: ReviewAndConfirm,
    },
};

export const MAIN_STEPS = [Step.SPECIFICATIONS, Step.COST_AND_DURATION, Step.DEPLOYMENT];
