import DeeployWrapper from '@components/deeploy-app/DeeployWrapper';
import AppTypeSelect from '@components/deeploy-app/steps/AppTypeSelect';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

function DeeployApp() {
    const { appType } = useDeploymentContext() as DeploymentContextType;

    const schema = z.object({
        targetNodesCount: z
            .number({
                required_error: 'Value is required',
                invalid_type_error: 'Value must be a number',
            })
            .int('Value must be a whole number')
            .min(1, 'Value must be at least 1')
            .max(100, 'Value cannot exceed 100'),
    });

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        mode: 'onBlur',
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
