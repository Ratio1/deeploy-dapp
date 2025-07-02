import DeeployWrapper from '@components/deeploy-app/DeeployWrapper';
import AppTypeSelect from '@components/deeploy-app/steps/AppTypeSelect';
import { APPLICATION_TYPES } from '@data/applicationTypes';
import { CONTAINER_TYPES } from '@data/containerTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

function DeeployApp() {
    const { appType } = useDeploymentContext() as DeploymentContextType;

    // TODO: Move to a separate file
    const schema = z.object({
        applicationType: z.enum(APPLICATION_TYPES, {
            required_error: 'Application type is required',
        }),
        targetNodesCount: z
            .number({
                required_error: 'Value is required',
                invalid_type_error: 'Value must be a number',
            })
            .int('Value must be a whole number')
            .min(1, 'Value must be at least 1')
            .max(100, 'Value cannot exceed 100'),
        containerType: z.enum(CONTAINER_TYPES, {
            required_error: 'Container type is required',
        }),
        cpu: z
            .number({
                required_error: 'Value is required',
                invalid_type_error: 'Value must be a number',
            })
            .int('Value must be a whole number')
            .min(1, 'Value must be at least 1')
            .max(100, 'Value cannot exceed 100'),
        memory: z
            .number({
                required_error: 'Value is required',
                invalid_type_error: 'Value must be a number',
            })
            .int('Value must be a whole number')
            .min(1, 'Value must be at least 1')
            .max(1000, 'Value cannot exceed 1000'),
        customCpu: z
            .number({
                required_error: 'Value is required',
                invalid_type_error: 'Value must be a number',
            })
            .int('Value must be a whole number')
            .min(1, 'Value must be at least 1')
            .max(100, 'Value cannot exceed 100'),
        customMemory: z
            .number({
                required_error: 'Value is required',
                invalid_type_error: 'Value must be a number',
            })
            .int('Value must be a whole number')
            .min(1, 'Value must be at least 1')
            .max(1000000, 'Value cannot exceed 1000000'),
    });

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        mode: 'onBlur',
        defaultValues: {
            applicationType: APPLICATION_TYPES[0],
            containerType: CONTAINER_TYPES[0],
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
