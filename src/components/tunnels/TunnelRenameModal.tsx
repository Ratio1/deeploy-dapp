import { Form } from '@heroui/form';
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@heroui/modal';
import StyledInput from '@shared/StyledInput';
import SubmitButton from '@shared/SubmitButton';
import { Tunnel } from '@typedefs/tunnels';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { toast } from 'react-hot-toast';

interface TunnelRenameModalRef {
    trigger: (tunnel: Tunnel, onRename: (alias: string) => void) => void;
}

const TunnelRenameModal = forwardRef<TunnelRenameModalRef>((_props, ref) => {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [alias, setAlias] = useState<string>('');

    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

    const [tunnel, setTunnel] = useState<Tunnel>();

    const [callback, setCallback] = useState<((alias: string) => void) | null>(null);

    // Init
    useEffect(() => {}, []);

    const trigger = (tunnel: Tunnel, onRename: (alias: string) => void) => {
        setLoading(false);
        setTunnel(tunnel);
        setAlias(tunnel.alias);
        setCallback(() => onRename);
        onOpen();
    };

    useImperativeHandle(ref, () => ({
        trigger,
    }));

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log('onSubmit', alias);

        if (callback) {
            setLoading(true);

            try {
                callback(alias.trim());
                onClose();
            } catch (error) {
                console.error('Error renaming tunnel:', error);
                toast.error('Error renaming tunnel.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm" shouldBlockScroll={false} placement="center">
            <ModalContent>
                <ModalHeader>Rename Tunnel</ModalHeader>

                <ModalBody>
                    <div className="col pb-2">
                        <Form className="w-full" validationBehavior="native" onSubmit={onSubmit}>
                            <div className="col w-full gap-2">
                                <div className="text-sm font-medium text-slate-500">Alias</div>

                                <StyledInput
                                    value={alias}
                                    onValueChange={(value) => setAlias(value)}
                                    validate={(value) => {
                                        const trimmedValue = value?.trim();

                                        if (!trimmedValue) {
                                            return 'Alias is required';
                                        }
                                        if (trimmedValue.length < 3) {
                                            return 'Alias must be at least 3 characters';
                                        }

                                        return null;
                                    }}
                                    placeholder="Enter new alias"
                                />
                            </div>

                            <div className="flex justify-end">
                                {/* TODO: Add isLoading */}
                                <SubmitButton label="Rename" />
                            </div>
                        </Form>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
});

TunnelRenameModal.displayName = 'TunnelRenameModal';

export default TunnelRenameModal;
