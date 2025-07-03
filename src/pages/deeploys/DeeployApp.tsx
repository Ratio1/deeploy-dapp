import DeeployWrapper from '@components/deeploy-app/DeeployWrapper';
import AppTypeSelect from '@components/deeploy-app/steps/AppTypeSelect';
import { APPLICATION_TYPES } from '@data/applicationTypes';
import { BOOLEAN_TYPES } from '@data/booleanTypes';
import { CONTAINER_TYPES } from '@data/containerTypes';
import { POLICY_TYPES } from '@data/policyTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { deeployAppSchema } from '@typedefs/schemas';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

function DeeployApp() {
    const { appType } = useDeploymentContext() as DeploymentContextType;

    const form = useForm<z.infer<typeof deeployAppSchema>>({
        resolver: zodResolver(deeployAppSchema),
        mode: 'onBlur',
        defaultValues: {
            // Step: Specifications
            applicationType: APPLICATION_TYPES[0],
            containerType: CONTAINER_TYPES[0],
            // Step: Deployment
            targetNodes: [],
            envVars: [{ key: '', value: '' }],
            enableNgrok: BOOLEAN_TYPES[0],
            restartPolicy: POLICY_TYPES[0],
            imagePullPolicy: POLICY_TYPES[0],
        },
    });

    return (
        <FormProvider {...form}>
            <div className="w-full flex-1">
                <div className="mx-auto max-w-[626px]">{!appType ? <AppTypeSelect /> : <DeeployWrapper />}</div>
            </div>
        </FormProvider>
    );
}

export default DeeployApp;
