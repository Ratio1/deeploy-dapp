import InputWithLabel from '../../InputWithLabel';
import WorkerContainerCommandsSection from './WorkerContainerCommandsSection';

export default function WorkerContainerSection() {
    return (
        <div className="col gap-4">
            <div className="flex gap-4">
                <InputWithLabel
                    name="deployment.container.githubUrl"
                    label="GitHub URL"
                    placeholder="https://github.com/user/repo"
                />
                <InputWithLabel name="deployment.container.accessToken" label="Access Token" placeholder="" isOptional />
            </div>

            <WorkerContainerCommandsSection />
        </div>
    );
}
