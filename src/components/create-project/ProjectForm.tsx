import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import SubmitButton from '@shared/SubmitButton';
import { RiBox3Line } from 'react-icons/ri';
import ColorSelect from './ColorSelect';

function ProjectForm() {
    return (
        <div className="col items-center gap-8">
            <div className="col items-center gap-4">
                <div className="flex">
                    <div className="bg-primary rounded-full p-2.5 text-2xl text-white">
                        <RiBox3Line />
                    </div>
                </div>

                <div className="col gap-1.5 text-center">
                    <div className="big-title">New Project</div>

                    <div className="max-w-[260px] text-[15px] text-slate-500">
                        Deploy a project with multiple jobs across the decentralized edge
                    </div>
                </div>
            </div>

            <div className="col w-full gap-4">
                <SlateCard>
                    <div className="col gap-4">
                        <InputWithLabel name="name" label="Name" placeholder="Project" />
                        <ColorSelect />
                    </div>
                </SlateCard>
            </div>

            <SubmitButton label="Create Project" />
        </div>
    );
}

export default ProjectForm;
