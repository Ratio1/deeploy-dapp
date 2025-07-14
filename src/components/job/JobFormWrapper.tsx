import Deployment from '@components/job/job-steps/Deployment';
import PaymentSummary from '@components/job/job-steps/PaymentSummary';
import Specifications from '@components/job/job-steps/Specifications';
import JobFormButtons from '@components/job/JobFormButtons';
import JobFormHeader from '@components/job/JobFormHeader';
import { APPLICATION_TYPES } from '@data/applicationTypes';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CONTAINER_TYPES } from '@data/containerTypes';
import { DYNAMIC_ENV_TYPES } from '@data/dynamicEnvTypes';
import { PLUGIN_SIGNATURE_TYPES } from '@data/pluginSignatureTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { SERVICE_TYPES } from '@data/serviceTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { deeployAppSchema } from '@schemas/index';
import { FormType } from '@typedefs/deployment';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

const STEPS = ['Project', 'Specifications', 'Payment Summary', 'Deployment'];

function JobFormWrapper() {
    const { step, formType } = useDeploymentContext() as DeploymentContextType;

    const getBaseSchemaDefaults = () => ({
        specifications: {
            applicationType: APPLICATION_TYPES[0],
            containerType: CONTAINER_TYPES[0],
            targetNodesCount: '', // Number inputs must have empty default values when resetting form
            cpu: '',
            memory: '',
            customCpu: '',
            customMemory: '',
        },
        deployment: {
            enableNgrok: BOOLEAN_TYPES[0],
        },
    });

    const getGenericSchemaDefaults = () => ({
        ...getBaseSchemaDefaults(),
        deployment: {
            ...getBaseSchemaDefaults().deployment,
            port: '',
            envVars: [{ key: '', value: '' }],
            dynamicEnvVars: [
                {
                    key: '',
                    values: [
                        { type: DYNAMIC_ENV_TYPES[0], value: '' },
                        { type: DYNAMIC_ENV_TYPES[0], value: '' },
                        { type: DYNAMIC_ENV_TYPES[0], value: '' },
                    ],
                },
            ],
            restartPolicy: POLICY_TYPES[0],
            imagePullPolicy: POLICY_TYPES[0],
        },
    });

    const getNativeSchemaDefaults = () => ({
        ...getBaseSchemaDefaults(),
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
        deployment: {
            ...getBaseSchemaDefaults().deployment,
            serviceType: SERVICE_TYPES[0],
            envVars: [{ key: '', value: '' }],
            dynamicEnvVars: [
                {
                    key: '',
                    values: [
                        { type: DYNAMIC_ENV_TYPES[0], value: '' },
                        { type: DYNAMIC_ENV_TYPES[0], value: '' },
                        { type: DYNAMIC_ENV_TYPES[0], value: '' },
                    ],
                },
            ],
        },
    });

    const getDefaultSchemaValues = () => {
        switch (formType) {
            case FormType.Generic:
                return getGenericSchemaDefaults();

            case FormType.Native:
                return getNativeSchemaDefaults();

            case FormType.Service:
                return getServiceSchemaDefaults();

            default:
                return {};
        }
    };

    const form = useForm<z.infer<typeof deeployAppSchema>>({
        resolver: zodResolver(deeployAppSchema),
        mode: 'onTouched',
        defaultValues: getDefaultSchemaValues(),
    });

    // Reset form with correct defaults when formType changes
    useEffect(() => {
        if (formType) {
            const defaults = getDefaultSchemaValues();
            form.reset(defaults);

            form.setValue('formType', formType);
        }
    }, [formType, form]);

    const onSubmit = (data: z.infer<typeof deeployAppSchema>) => {
        console.log('[JobFormWrapper] onSubmit');

        if (data.formType === FormType.Generic) {
            console.log('[JobFormWrapper] Generic app deployment', data);
        }

        if (data.formType === FormType.Native) {
            console.log('[JobFormWrapper] Native app deployment', data);
        }

        if (data.formType === FormType.Service) {
            console.log('[JobFormWrapper] Service deployment', data);
        }
    };

    const onError = (errors) => {
        console.log('[JobFormWrapper] Validation errors:', errors);
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} key={formType || 'no-type'}>
                <div className="w-full flex-1">
                    <div className="mx-auto max-w-[626px]">
                        <div className="col gap-6">
                            <JobFormHeader steps={STEPS} />

                            {step === 2 && <Specifications />}
                            {step === 3 && <PaymentSummary />}
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
