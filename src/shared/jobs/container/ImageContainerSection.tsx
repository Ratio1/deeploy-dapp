import InputWithLabel from '../../InputWithLabel';

export default function ImageContainerSection() {
    return (
        <div className="col gap-4">
            <div className="flex gap-4">
                <InputWithLabel name="deployment.container.containerImage" label="Image" placeholder="repo/image:tag" />
                <InputWithLabel
                    name="deployment.container.containerRegistry"
                    label="Container Registry"
                    placeholder="docker.com"
                />
            </div>

            <div className="flex gap-4">
                <InputWithLabel
                    name="deployment.container.crUsername"
                    autoComplete="username"
                    label="Username"
                    placeholder=""
                />
                <InputWithLabel
                    name="deployment.container.crPassword"
                    type="password"
                    autoComplete="current-password"
                    label="Password"
                    placeholder=""
                />
            </div>
        </div>
    );
}
