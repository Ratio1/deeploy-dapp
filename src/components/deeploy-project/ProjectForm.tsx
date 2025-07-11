import { Button } from '@heroui/button';
import { DeploymentContextType, useDeploymentContext } from '@lib/contexts/deployment';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/InputWithLabel';
import { RiBox3Line, RiTelegram2Line } from 'react-icons/ri';
import { Link } from 'react-router-dom';

function ProjectForm() {
    const { setFormType, setStep } = useDeploymentContext() as DeploymentContextType;

    return (
        <div className="col gap-12">
            <div className="col items-center gap-8">
                <div className="col items-center gap-4">
                    <div className="flex">
                        <div className="rounded-full bg-primary p-2.5 text-2xl text-white">
                            <RiBox3Line />
                        </div>
                    </div>

                    <div className="col gap-1.5 text-center">
                        <div className="big-title">Deeploy Project</div>

                        <div className="max-w-[360px] text-[15px] text-slate-500">Deploy a new project with multiple jobs</div>
                    </div>
                </div>

                <div className="col w-full gap-4">
                    <SlateCard>
                        <div className="col gap-4">
                            <InputWithLabel name="name" label="Name" placeholder="Project" />
                        </div>
                    </SlateCard>
                </div>
            </div>

            <div className="col items-center gap-5 text-center">
                <div className="col gap-2.5">
                    <div className="font-semibold leading-none">Need Help?</div>
                    <div className="text-[15px] leading-none text-slate-500">
                        Connect with our support team for any questions or assistance.
                    </div>
                </div>

                <Button
                    className="h-9 bg-slate-200 px-3.5"
                    color="default"
                    variant="flat"
                    size="sm"
                    as={Link}
                    to="https://t.me/Ratio1Protocol"
                    target="_blank"
                >
                    <div className="row gap-1.5">
                        <div className="text-sm font-medium">Contact Support</div>
                        <RiTelegram2Line className="text-xl" />
                    </div>
                </Button>
            </div>
        </div>
    );
}

export default ProjectForm;
