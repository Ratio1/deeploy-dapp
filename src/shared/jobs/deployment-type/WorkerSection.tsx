import InputWithLabel from '../../InputWithLabel';
import WorkerCommandsSection from './WorkerCommandsSection';

export default function WorkerSection() {
    return (
        <div className="col gap-4">
            <div className="flex gap-4">
                <InputWithLabel name="deployment.deploymentType.image" label="Image" placeholder="node:22" />
                <InputWithLabel
                    name="deployment.deploymentType.repository"
                    label="GitHub Repository"
                    placeholder="org/repository"
                />
            </div>

            <div className="flex gap-4">
                <InputWithLabel
                    name="deployment.deploymentType.owner"
                    label="Repository Owner"
                    placeholder="Username/Organization"
                />
                <InputWithLabel name="deployment.deploymentType.username" label="Username" placeholder="Username" />
            </div>

            <div className="flex gap-4">
                <InputWithLabel
                    name="deployment.deploymentType.accessToken"
                    label="Access Token"
                    placeholder="None"
                    isOptional
                />
            </div>

            <WorkerCommandsSection />
        </div>
    );
}
