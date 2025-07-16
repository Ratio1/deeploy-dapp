import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '../InputWithLabel';

export default function ContainerSection() {
    return (
        <SlateCard title="Container">
            <div className="col gap-4">
                <div className="flex gap-4">
                    <InputWithLabel name="deployment.containerImage" label="Image" placeholder="repo/image:tag" />
                    <InputWithLabel
                        name="deployment.containerRegistry"
                        label="Server (Container Registry)"
                        placeholder="docker.io"
                    />
                </div>

                <div className="flex gap-4">
                    <InputWithLabel name="deployment.crUsername" autoComplete="username" label="Username" placeholder="" />
                    <InputWithLabel
                        name="deployment.crPassword"
                        type="password"
                        autoComplete="current-password"
                        label="Password"
                        placeholder=""
                    />
                </div>
            </div>
        </SlateCard>
    );
}
