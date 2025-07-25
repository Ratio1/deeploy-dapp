import InputWithLabel from '../../InputWithLabel';
import WorkerContainerCommandsSection from './WorkerContainerCommandsSection';

export default function WorkerContainerSection() {
    return (
        <div className="col gap-4">
            <div className="flex gap-4">
                <InputWithLabel name="deployment.githubUrl" label="GitHub URL" placeholder="https://github.com/user/repo" />
                <InputWithLabel name="deployment.accessToken" label="Access Token (optional)" placeholder="" />
            </div>

            <WorkerContainerCommandsSection />
        </div>
    );
}
