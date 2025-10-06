import { DEEPLOY_FLOW_ACTION_KEYS, DEEPLOY_FLOW_ACTIONS } from '@data/deeployFlowActions';
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@heroui/modal';
import { Spinner } from '@heroui/spinner';
import { DetailedAlert } from '@shared/DetailedAlert';
import { forwardRef, JSX, useImperativeHandle, useState } from 'react';
import { RiCheckDoubleLine, RiCheckLine, RiCloseLine } from 'react-icons/ri';

export const DeeployFlowModal = forwardRef(
    (
        { actions, descriptionFN }: { actions: DEEPLOY_FLOW_ACTION_KEYS[]; descriptionFN: (jobsCount: number) => JSX.Element },
        ref,
    ) => {
        const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

        const [currentAction, setCurrentAction] = useState<DEEPLOY_FLOW_ACTION_KEYS>(actions[0]);
        const [jobsCount, setJobsCount] = useState<number>(1);

        const [error, setError] = useState<boolean>(false);

        const open = (jobsCount: number) => {
            setJobsCount(jobsCount);
            setCurrentAction(actions[0]);
            setError(false);
            onOpen();
        };

        const progress = (action: DEEPLOY_FLOW_ACTION_KEYS) => {
            setCurrentAction(action);
        };

        const close = () => {
            onClose();
        };

        const displayError = () => {
            setError(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        };

        useImperativeHandle(ref, () => ({
            open,
            progress,
            close,
            displayError,
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

        const getJobDone = () => {
            return (
                <div className="z-10 -ml-1.5 bg-white p-1.5">
                    <div className="center-all rounded-full bg-green-100 p-1">
                        <div className="text-[17px] text-green-600">
                            <RiCheckLine />
                        </div>
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

        const getCurrentJobIcon = () => {
            if (error) {
                return (
                    <div className="z-10 -ml-1.5 bg-white p-1.5">
                        <div className="center-all rounded-full bg-red-100 p-1">
                            <div className="text-[17px] text-red-600">
                                <RiCloseLine />
                            </div>
                        </div>
                    </div>
                );
            }

            return getJobLoading();
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
                        <div className="col -mt-4 gap-2">
                            <DetailedAlert
                                icon={<RiCheckDoubleLine />}
                                title="Confirmation"
                                description={descriptionFN(jobsCount)}
                            ></DetailedAlert>

                            <div className="col relative mx-auto my-4 gap-6 text-[15px]">
                                {actions.map((action, index, array) => {
                                    const currentIndex = array.indexOf(currentAction);

                                    return (
                                        <div key={index} className="row gap-1.5">
                                            {index === currentIndex
                                                ? getCurrentJobIcon()
                                                : index < currentIndex || currentIndex === -1
                                                  ? getJobDone()
                                                  : getJobPending(DEEPLOY_FLOW_ACTIONS[action].icon)}

                                            <div>{DEEPLOY_FLOW_ACTIONS[action].title}</div>
                                        </div>
                                    );
                                })}

                                {/* Vertical bar */}
                                <div className="bg-primary-100 absolute top-3 bottom-3 left-[11px] w-[2px]" />
                            </div>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        );
    },
);
