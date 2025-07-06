import DeeployWrapper from '@components/deeploy-app/DeeployWrapper';
import FormTypeSelect from '@components/deeploy-app/steps/FormTypeSelect';
import { APPLICATION_TYPES } from '@data/applicationTypes';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CONTAINER_TYPES } from '@data/containerTypes';
import { DYNAMIC_ENV_TYPES } from '@data/dynamicEnvTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { deeployAppSchema } from '@schemas/index';
import { FormType } from '@typedefs/deployment';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

function DeeployApp() {
    const { formType } = useDeploymentContext() as DeploymentContextType;

    const form = useForm<z.infer<typeof deeployAppSchema>>({
        resolver: zodResolver(deeployAppSchema),
        mode: 'onTouched',
        defaultValues: {
            specifications: {
                applicationType: APPLICATION_TYPES[0],
                containerType: CONTAINER_TYPES[0],
            },
            deployment: {
                targetNodes: [{ address: '' }],
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
                enableNgrok: BOOLEAN_TYPES[0],
                restartPolicy: POLICY_TYPES[0],
                imagePullPolicy: POLICY_TYPES[0],
            },
        },
    });

    const onSubmit = (data: z.infer<typeof deeployAppSchema>) => {
        console.log('[DeeployApp] onSubmit', data);

        if (data.formType === FormType.Generic) {
            console.log('[DeeployApp] Generic app deployment', data);
        }
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="w-full flex-1">
                    <div className="mx-auto max-w-[626px]">{!formType ? <FormTypeSelect /> : <DeeployWrapper />}</div>
                </div>
            </form>
        </FormProvider>
    );
}

export default DeeployApp;
