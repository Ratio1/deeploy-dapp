import { render, screen, act } from '@testing-library/react';
import { FormProvider, type UseFormReturn, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { useEffect } from 'react';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CR_VISIBILITY_OPTIONS } from '@data/crVisibilityOptions';
import { genericContainerTypes } from '@data/containerResources';
import { POLICY_TYPES } from '@data/policyTypes';
import { jobSchema } from '@schemas/index';
import { JobType, RunningJobWithResources } from '@typedefs/deeploys';
import { PluginType } from '@typedefs/steps/deploymentStepTypes';
import ReviewAndConfirm from '@components/edit-job/ReviewAndConfirm';
import { z } from 'zod';

vi.mock('@lib/config', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@lib/config')>();
    return {
        ...actual,
        getCurrentEpoch: () => 5,
    };
});

const defaultValues: z.infer<typeof jobSchema> = {
    jobType: JobType.Generic,
    specifications: {
        targetNodesCount: 2,
        jobTags: [],
        nodesCountries: [],
        containerType: genericContainerTypes[0].name,
        gpuType: undefined,
    },
    costAndDuration: {
        duration: 1,
        paymentMonthsCount: 1,
    },
    deployment: {
        jobAlias: 'demo-generic-1',
        autoAssign: true,
        targetNodes: [],
        spareNodes: [],
        allowReplicationInTheWild: true,
        enableTunneling: BOOLEAN_TYPES[1],
        port: '',
        tunnelingToken: '',
        tunnelingLabel: '',
        deploymentType: {
            pluginType: PluginType.Container,
            containerImage: 'ratio1/app:1',
            containerRegistry: 'docker.io',
            crVisibility: CR_VISIBILITY_OPTIONS[0],
            crUsername: '',
            crPassword: '',
        },
        ports: [],
        envVars: [],
        dynamicEnvVars: [],
        volumes: [],
        fileVolumes: [],
        restartPolicy: POLICY_TYPES[0],
        imagePullPolicy: POLICY_TYPES[0],
        customParams: [],
    },
};

const job = {
    resources: {
        containerOrWorkerType: genericContainerTypes[0],
        gpuType: undefined,
        jobType: JobType.Generic,
    },
    lastExecutionEpoch: 10n,
} as unknown as RunningJobWithResources;

type JobFormValues = z.infer<typeof jobSchema>;

const ReviewWrapper = ({ onReady }: { onReady: (form: UseFormReturn<JobFormValues>) => void }) => {
    const form = useForm<JobFormValues>({ defaultValues });

    useEffect(() => {
        onReady(form);
    }, [form, onReady]);

    return (
        <FormProvider {...form}>
            <ReviewAndConfirm defaultValues={defaultValues} job={job} />
        </FormProvider>
    );
};

describe('ReviewAndConfirm', () => {
    it('highlights modified steps and additional cost', async () => {
        let formApi: UseFormReturn<JobFormValues> | undefined;

        render(
            <ReviewWrapper
                onReady={(form) => {
                    formApi = form;
                }}
            />,
        );

        expect(screen.getByText('Summary of Changes')).toBeInTheDocument();

        act(() => {
            formApi?.setValue('specifications.targetNodesCount', 3, { shouldDirty: true });
        });

        expect(screen.getByText('Target Nodes Count (increased from 2 to 3)')).toBeInTheDocument();
        const totalDueRow = screen.getByText('Total Amount Due').closest('.row') ?? screen.getByText('Total Amount Due');
        const totalDueText = totalDueRow.textContent?.replace(/\s+/g, ' ').trim();

        expect(totalDueText).toMatch(/Total Amount Due.*~\$USDC\s*0[.,]5/);
    });
});
