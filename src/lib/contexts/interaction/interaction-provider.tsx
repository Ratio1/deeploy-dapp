import { Button } from '@heroui/button';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/modal';
import { useDisclosure } from '@heroui/use-disclosure';
import { SignMessageModal } from '@shared/SignMessageModal';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ConfirmOptions } from '.';
import { InteractionContext } from './context';

export const InteractionProvider = ({ children }) => {
    // Confirmation Modal
    const [content, setContent] = useState<React.ReactNode>();
    const [isLoading, setLoading] = useState(false);
    const [modalSize, setModalSize] = useState<'sm' | 'md' | 'lg'>('sm');
    const [confirmButtonClassNames, setConfirmButtonClassNames] = useState<string>('bg-red-500');

    const resolver = useRef<((v: boolean) => void) | undefined>(undefined);
    const callback = useRef<(() => Promise<any>) | undefined>(undefined);

    const {
        isOpen: isConfirmationModalOpen,
        onOpen: onConfirmationModalOpen,
        onClose: onConfirmationModalClose,
    } = useDisclosure();

    // Sign Message Modal
    const signMessageModalRef = useRef<{
        open: () => void;
        close: () => void;
    }>(null);

    const confirm = (content: React.ReactNode, options?: ConfirmOptions) => {
        setContent(content);
        setLoading(false);

        setModalSize(options?.modalSize || 'sm');
        setConfirmButtonClassNames(options?.confirmButtonClassNames || 'bg-red-500');

        onConfirmationModalOpen();

        return new Promise<boolean>((resolve) => {
            resolver.current = resolve;
            callback.current = options?.onConfirm;
        });
    };

    const handleConfirm = async () => {
        if (callback.current) {
            setLoading(true);

            try {
                await callback.current();
                resolver.current?.(true);
                onConfirmationModalClose();
            } catch (error) {
                console.error('Error in confirmation function:', error);
                toast.error('Unexpected error occurred, please try again.');
            } finally {
                setLoading(false);
            }
        } else {
            resolver.current?.(true);
            onConfirmationModalClose();
        }
    };

    const handleCancel = () => {
        resolver.current?.(false);
        onConfirmationModalClose();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resolver.current?.(false);
        }
    };

    const openSignMessageModal = () => {
        signMessageModalRef.current?.open();
    };

    const closeSignMessageModal = () => {
        signMessageModalRef.current?.close();
    };

    return (
        <InteractionContext.Provider value={{ confirm, openSignMessageModal, closeSignMessageModal }}>
            {children}

            {/* Confirmation Modal */}
            <Modal
                isOpen={isConfirmationModalOpen}
                size={modalSize}
                onClose={onConfirmationModalClose}
                onOpenChange={handleOpenChange}
                classNames={{
                    closeButton: 'cursor-pointer',
                }}
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">Confirmation</ModalHeader>
                    <ModalBody>{content}</ModalBody>
                    <ModalFooter className="mb-0.5">
                        <Button className="slate-button" color="default" onPress={handleCancel} isDisabled={isLoading}>
                            Cancel
                        </Button>

                        <Button
                            className={confirmButtonClassNames}
                            color="danger"
                            onPress={handleConfirm}
                            isLoading={isLoading}
                        >
                            Confirm
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Sign Message Modal */}
            <SignMessageModal ref={signMessageModalRef} />
        </InteractionContext.Provider>
    );
};
