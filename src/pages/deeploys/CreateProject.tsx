import ProjectForm from '@components/create-project/ProjectForm';
import { COLOR_TYPES } from '@data/colorTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { projectSchema } from '@schemas/project';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

function CreateProject() {
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof projectSchema>>({
        resolver: zodResolver(projectSchema),
        mode: 'onTouched',
        defaultValues: {
            name: '',
            color: COLOR_TYPES[0].hex,
        },
    });

    const onSubmit = async (data: z.infer<typeof projectSchema>) => {
        const project = {
            ...data,
            datetime: new Date().toISOString(),
        };

        const id = await db.projects.add(project);

        navigate(`${routePath.deeploys}/${routePath.project}/${id}`);
    };

    const onError = (errors) => {
        console.log('[CreateProject] Validation errors:', errors);
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

export default CreateProject;
