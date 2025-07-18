import { Button } from '@heroui/button';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/modal';
import { useDisclosure } from '@heroui/use-disclosure';
import { useRef, useState } from 'react';
import { InteractionContext, InteractionContextType } from './context';

export const InteractionProvider = ({ children }) => {
    const [content, setContent] = useState<React.ReactNode>();
    const resolver = useRef<((v: boolean) => void) | undefined>(undefined);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const confirm: InteractionContextType = (content: React.ReactNode) => {
        setContent(content);
        onOpen();

        return new Promise<boolean>((resolve) => {
            resolver.current = resolve;
        });
    };

    const handleConfirm = () => {
        resolver.current?.(true);
        onClose();
    };

    const handleCancel = () => {
        resolver.current?.(false);
        onClose();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resolver.current?.(false);
        }
    };

    return (
        <InteractionContext.Provider value={confirm}>
            {children}

            <Modal isOpen={isOpen} size="sm" onClose={onClose} onOpenChange={handleOpenChange} placement="center">
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">Confirmation</ModalHeader>
                    <ModalBody>{content}</ModalBody>
                    <ModalFooter className="mb-0.5">
                        <Button className="slate-button" color="default" onPress={handleCancel}>
                            Cancel
                        </Button>

                        <Button className="bg-red-500" color="danger" onPress={handleConfirm}>
                            Confirm
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </InteractionContext.Provider>
    );
};
