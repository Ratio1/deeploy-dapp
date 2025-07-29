import JobFormButtons from '@components/jobs/JobFormButtons';
import JobFormHeader from '@components/jobs/JobFormHeader';
import Deployment from '@components/jobs/steps/Deployment';
import PaymentAndDuration from '@components/jobs/steps/PaymentAndDuration';
import Specifications from '@components/jobs/steps/Specifications';
import { APPLICATION_TYPES } from '@data/applicationTypes';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { genericContainerTypes, nativeWorkerTypes, serviceContainerTypes } from '@data/containerResources';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import db from '@lib/storage/db';
import { isValidId } from '@lib/utils';
import { jobSchema } from '@schemas/index';
import { Job, JobType } from '@typedefs/deeploys';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

const STEPS = ['Project', 'Specifications', 'Payment & Duration', 'Deployment'];

function JobFormWrapper() {
    const { id: projectId } = useParams();

    const { step, jobType, setJobType } = useDeploymentContext() as DeploymentContextType;

    const getBaseSchemaDefaults = () => ({
        specifications: {
            applicationType: APPLICATION_TYPES[0],
            targetNodesCount: '', // Number inputs must have empty default values when resetting form
        },
        paymentAndDuration: {
            duration: 12,
            paymentMonthsCount: 1,
        },
        deployment: {
            enableTunneling: BOOLEAN_TYPES[0],
            targetNodes: [{ address: '' }],
        },
    });

    const getGenericSchemaDefaults = () => ({
        ...getBaseSchemaDefaults(),
        specifications: {
            ...getBaseSchemaDefaults().specifications,
            containerType: genericContainerTypes[0].name,
        },
        deployment: {
            ...getBaseSchemaDefaults().deployment,
            container: {
                type: 'image',
                containerImage: '',
                containerRegistry: '',
                crUsername: '',
                crPassword: '',
            },
            port: '',
            restartPolicy: POLICY_TYPES[0],
            imagePullPolicy: POLICY_TYPES[0],
        },
    });

    const getNativeSchemaDefaults = () => ({
        ...getBaseSchemaDefaults(),
        specifications: {
            ...getBaseSchemaDefaults().specifications,
            workerType: nativeWorkerTypes[0].name,
        },
        deployment: {
            ...getBaseSchemaDefaults().deployment,
            port: '',
            pluginSignature: PLUGIN_SIGNATURE_TYPES[0],
            customParams: [{ key: '', value: '' }],
            pipelineParams: [{ key: '', value: '' }],
            chainstoreResponse: BOOLEAN_TYPES[1],
        },
    });

    const getServiceSchemaDefaults = () => ({
        ...getBaseSchemaDefaults(),
        specifications: {
            ...getBaseSchemaDefaults().specifications,
            containerType: serviceContainerTypes[0].name,
        },
        deployment: {
            ...getBaseSchemaDefaults().deployment,
        },
    });

    const getDefaultSchemaValues = () => {
        switch (jobType) {
            case JobType.Generic:
                return getGenericSchemaDefaults();

            case JobType.Native:
                return getNativeSchemaDefaults();

            case JobType.Service:
                return getServiceSchemaDefaults();

            default:
                return {};
        }
    };

    const form = useForm<z.infer<typeof jobSchema>>({
        resolver: zodResolver(jobSchema),
        mode: 'onTouched',
        defaultValues: getDefaultSchemaValues(),
    });

    // Reset form with correct defaults when jobType changes
    useEffect(() => {
        if (jobType) {
            const defaults = getDefaultSchemaValues();
            form.reset(defaults);

            form.setValue('jobType', jobType);
        }
    }, [jobType, form]);

    const onSubmit = async (data: z.infer<typeof jobSchema>) => {
        console.log('[JobFormWrapper] onSubmit', data);

        if (!isValidId(projectId)) {
            console.error('[JobFormWrapper] Invalid project ID');
            toast.error('Invalid project ID.');
            return;
        }

        try {
            const job = {
                projectId: parseInt(projectId as string),
                jobType: data.jobType,
                specifications: data.specifications,
                paymentAndDuration: data.paymentAndDuration,
                deployment: data.deployment,
            };

            const jobId = await db.jobs.add(job as Job);

            console.log('[JobFormWrapper] Job added successfully', jobId);
            toast.success('Job added successfully.');

            // Navigate back to the project overview
            setJobType(undefined);
        } catch (error) {
            console.error('[JobFormWrapper] Error adding job:', error);
            toast.error('Failed to add job');
        }
    };

    const onError = (errors) => {
        console.log('[JobFormWrapper] Validation errors:', errors);
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} key={jobType || 'no-type'}>
                <div className="w-full flex-1">
                    <div className="mx-auto max-w-[626px]">
                        <div className="col gap-6">
                            <JobFormHeader steps={STEPS} />

                            {step === 2 && <Specifications />}
                            {step === 3 && <PaymentAndDuration />}
                            {step === 4 && <Deployment />}

                            <JobFormButtons steps={STEPS} />
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}

export default JobFormWrapper;
