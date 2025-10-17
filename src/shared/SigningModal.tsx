import { Modal, ModalBody, ModalContent, useDisclosure } from '@heroui/modal';
import { Spinner } from '@heroui/spinner';
import { forwardRef, useImperativeHandle } from 'react';
import { useAccount } from 'wagmi';
import { DetailedAlert } from './DetailedAlert';

export const SigningModal = forwardRef(({ type }: { type: 'signMessage' | 'tokenApproval' }, ref) => {
    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
    const { connector } = useAccount();

    const open = () => {
        onModalOpen();
    };

    const close = () => {
        onModalClose();
    };

    useImperativeHandle(ref, () => ({
        open,
        close,
    }));

    return (
        <Modal
            isOpen={isModalOpen}
            size="xs"
            backdrop="blur"
            onClose={onModalClose}
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
                            title={type === 'signMessage' ? 'Sign Message' : 'Token Approval'}
                            description={
                                <div className="col items-center gap-4">
                                    <div className="text-[15px]">
                                        Please <span className="text-primary font-medium">sign</span> the required{' '}
                                        {type === 'signMessage' ? 'message' : 'spending cap request'} when prompted by your
                                        wallet extension.
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
