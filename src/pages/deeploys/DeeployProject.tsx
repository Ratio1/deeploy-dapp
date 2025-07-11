import ProjectForm from '@components/deeploy-project/ProjectForm';
import { COLOR_TYPES } from '@data/colorTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema } from '@schemas/project';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

function DeeployProject() {
    const form = useForm<z.infer<typeof projectSchema>>({
        resolver: zodResolver(projectSchema),
        mode: 'onTouched',
        defaultValues: {
            name: '',
            color: COLOR_TYPES[0].hex,
        },
    });

    const onSubmit = (data: z.infer<typeof projectSchema>) => {
        const values = {
            ...data,
            datetime: new Date().toISOString(),
        };

        console.log('[DeeployProject] onSubmit', values);
    };

    const onError = (errors) => {
        console.log('[DeeployProject] Validation errors:', errors);
    };

    return (
        <div className="w-full flex-1">
            <div className="mx-auto max-w-[466px]">
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                        <ProjectForm />
                    </form>
                </FormProvider>
            </div>
        </div>
    );
}

export default DeeployProject;
