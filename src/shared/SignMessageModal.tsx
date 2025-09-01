import { Modal, ModalBody, ModalContent, useDisclosure } from '@heroui/modal';
import { Spinner } from '@heroui/spinner';
import { forwardRef, useImperativeHandle } from 'react';
import { useAccount } from 'wagmi';
import { DetailedAlert } from './DetailedAlert';

export const SignMessageModal = forwardRef((_props, ref) => {
    const {
        isOpen: isSignMessageModalOpen,
        onOpen: onSignMessageModalOpen,
        onClose: onSignMessageModalClose,
    } = useDisclosure();
    const { connector } = useAccount();

    const open = () => {
        onSignMessageModalOpen();
    };

    const close = () => {
        onSignMessageModalClose();
    };

    useImperativeHandle(ref, () => ({
        open,
        close,
    }));

    return (
        <Modal
            isOpen={isSignMessageModalOpen}
            size="xs"
            backdrop="blur"
            onClose={onSignMessageModalClose}
            classNames={{
                closeButton: 'cursor-pointer',
            }}
        >
            <ModalContent>
                <ModalBody className="px-4">
                    <div className="col gap-2 py-6">
                        <DetailedAlert
                            icon={
                                <div className="center-all w-5">
                                    <Spinner size="sm" />
                                </div>
                            }
                            title="Sign Message"
                            description={
                                <div className="col items-center gap-4">
                                    <div className="text-[15px]">
                                        Please <span className="text-primary font-medium">sign</span> the required message when
                                        prompted by your wallet extension.
                                    </div>

                                    {!!connector?.icon && (
                                        <img src={connector.icon} alt="Wallet Logo" className="h-7 w-7 rounded-full" />
                                    )}
                                </div>
                            }
                        ></DetailedAlert>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
});
