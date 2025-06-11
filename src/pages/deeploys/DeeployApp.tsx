import { Button } from '@heroui/button';
import { CardWithHeader } from '@shared/cards/CardWithHeader';
import { RiBox3Line, RiFileCodeLine } from 'react-icons/ri';

function DeeployApp() {
    return (
        <div className="w-full flex-1">
            <div className="grid w-full grid-cols-2 gap-5">
                <CardWithHeader icon={<RiBox3Line />} title="Deploy an App">
                    <div className="col h-full w-full gap-4">
                        <div>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                            industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type
                            and scrambled it to make a type specimen book.
                        </div>

                        <div className="col gap-2">
                            <div className="text-center text-lg font-medium">Choose a template</div>

                            <div className="center-all gap-3">
                                <Button color="primary" variant="flat" size="sm" onPress={() => {}}>
                                    <div className="text-sm">Generic</div>
                                </Button>

                                <Button color="primary" variant="flat" size="sm" onPress={() => {}}>
                                    <div className="text-sm">Native</div>
                                </Button>

                                <Button color="primary" variant="flat" size="sm" onPress={() => {}}>
                                    <div className="text-sm">Service</div>
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardWithHeader>

                <CardWithHeader icon={<RiFileCodeLine />} title="Deploy a Template-App" isDisabled>
                    <div className="col h-full w-full justify-between">
                        <div className="text-slate-500">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                            et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                            aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                            cillum dolore eu fugiat nulla pariatur.
                        </div>

                        <div className="center-all">
                            <Button color="default" size="sm" isDisabled>
                                <div className="text-sm">Choose Template</div>
                            </Button>
                        </div>
                    </div>
                </CardWithHeader>
            </div>
        </div>
    );
}

export default DeeployApp;
