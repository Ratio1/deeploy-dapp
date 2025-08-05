import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@heroui/modal';
import { Spinner } from '@heroui/spinner';
import { DetailedAlert } from '@shared/DetailedAlert';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { RiBox3Line, RiCheckDoubleLine, RiEdit2Line, RiWalletLine } from 'react-icons/ri';

const ACTIONS = {
    payJobs: {
        icon: <RiWalletLine />,
        title: 'Pay for the jobs',
    },
    signMessages: {
        icon: <RiEdit2Line />,
        title: 'Sign messages with details',
    },
    callDeeployApi: {
        icon: <RiBox3Line />,
        title: 'Create the jobs',
    },
};

export const DeeployFlowModal = forwardRef((_props, ref) => {
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

    const [currentAction, setCurrentAction] = useState<'payJobs' | 'signMessages' | 'callDeeployApi'>('payJobs');
    const [jobsCount, setJobsCount] = useState<number>(1);

    const open = (jobsCount: number) => {
        setCurrentAction('payJobs');
        setJobsCount(jobsCount);
        onOpen();
    };

    const progress = (action: 'payJobs' | 'signMessages' | 'callDeeployApi') => {
        setCurrentAction(action);
    };

    const close = () => {
        onClose();
    };

    useImperativeHandle(ref, () => ({
        open,
        progress,
        close,
    }));

    const getJobLoading = () => {
        return (
            <div className="z-10 -ml-1.5 bg-white p-1.5">
                <div className="center-all h-[25px] w-[25px]">
                    <Spinner size="sm" />
                </div>
            </div>
        );
    };

    const getJobDone = (icon: React.ReactNode) => {
        return (
            <div className="z-10 -ml-1.5 bg-white p-1.5">
                <div className="center-all rounded-full bg-green-100 p-1">
                    <div className="text-[17px] text-green-600">{icon}</div>
                </div>
            </div>
        );
    };

    const getJobPending = (icon: React.ReactNode) => {
        return (
            <div className="z-10 -ml-1.5 bg-white p-1.5">
                <div className="center-all bg-primary-100 rounded-full p-1">
                    <div className="text-primary text-[17px]">{icon}</div>
                </div>
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="sm"
            backdrop="blur"
            shouldBlockScroll={true}
            classNames={{
                closeButton: 'cursor-pointer',
            }}
        >
            <ModalContent>
                <ModalHeader></ModalHeader>

                <ModalBody>
                    <div className="col -mt-4 gap-2 pb-2">
                        <DetailedAlert
                            icon={<RiCheckDoubleLine />}
                            title="Confirmation"
                            description={
                                <div className="text-[15px]">
                                    You'll need to confirm a{' '}
                                    <span className="text-primary font-medium">payment transaction</span> and sign{' '}
                                    <span className="text-primary font-medium">
                                        {jobsCount} message{jobsCount > 1 ? 's' : ''}
                                    </span>{' '}
                                    to deploy your job{jobsCount > 1 ? 's' : ''}.
                                </div>
                            }
                        ></DetailedAlert>

                        <div className="col relative mx-auto my-4 gap-6 text-[15px]">
                            {Object.keys(ACTIONS).map((action, index, array) => {
                                const currentIndex = array.indexOf(currentAction);

                                return (
                                    <div key={index} className="row gap-1.5">
                                        {index === currentIndex
                                            ? getJobLoading()
                                            : index < currentIndex
                                              ? getJobDone(ACTIONS[action].icon)
                                              : getJobPending(ACTIONS[action].icon)}

                                        <div>{ACTIONS[action].title}</div>
                                    </div>
                                );
                            })}

                            {/* Vertical bar */}
                            <div className="bg-primary-100 absolute top-3 bottom-3 left-[11px] w-[2px]" />
                        </div>

                        {/* <div className="col relative mx-auto my-4 gap-6 text-[15px]">
                            <div className="row gap-1.5">
                                {currentAction === 'payJobs' ? (
                                    <div className="z-10 -ml-1.5 bg-white p-1.5">
                                        <div className="center-all rounded-full bg-green-100 p-1">
                                            <RiCheckLine className="text-base text-green-600" />
                                        </div>
                                    </div>
                                ) : (
                                    getJobLoading()
                                )}

                                <div>Pay to deploy jobs</div>
                            </div>

                            <div className="row gap-1.5">
                                {currentAction === 'signMessages' ? (
                                    <div className="z-10 -ml-1.5 bg-white p-1.5">
                                        <div className="center-all bg-primary-100 rounded-full p-1">
                                            <RiArrowUpDownLine className="text-primary text-base" />
                                        </div>
                                    </div>
                                ) : (
                                    getJobLoading()
                                )}

                                <div>Sign messages with job details</div>
                            </div>

                            <div className="row gap-1.5">
                                {currentAction === 'callDeeployApi' ? (
                                    <div className="z-10 -ml-1.5 bg-white p-1.5">
                                        <div className="center-all bg-primary-100 rounded-full p-1">
                                            <RiBox2Line className="text-primary text-base" />
                                        </div>
                                    </div>
                                ) : (
                                    getJobLoading()
                                )}

                                <div>Create jobs</div>
                            </div>

                            <div className="bg-primary-100 absolute top-3 bottom-3 left-[11px] w-[2px]" />
                        </div> */}
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
});
