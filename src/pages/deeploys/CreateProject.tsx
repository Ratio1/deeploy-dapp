import ProjectForm from '@components/create-project/ProjectForm';
import { COLOR_TYPES } from '@data/colorTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { routePath } from '@lib/routes/route-paths';
import db from '@lib/storage/db';
import { projectSchema } from '@schemas/project';
import SupportFooter from '@shared/SupportFooter';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { keccak256, toBytes } from 'viem';
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
        const projectHash = keccak256(toBytes(crypto.randomUUID()));

        const project = {
            ...data,
            projectHash,
            createdAt: new Date().toISOString(),
        };

        try {
            await db.projects.add(project);
            navigate(`${routePath.deeploys}/${routePath.projectDraft}/${projectHash}`);
        } catch (error) {
            console.error('[CreateProject] Error adding project:', error);
            toast.error('Failed to create project.');
        }
    };

    const onError = (errors) => {
        console.log('[CreateProject] Validation errors:', errors);
    };

    return (
        <div className="col flex-1 justify-between gap-12">
            <div className="mx-auto w-sm">
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                        <ProjectForm />
                    </form>
                </FormProvider>
            </div>

            <SupportFooter />
        </div>
    );
}

export default CreateProject;
