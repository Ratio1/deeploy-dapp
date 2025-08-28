import { Form } from '@heroui/form';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@heroui/modal';
import { createTunnel, renameTunnel } from '@lib/api/tunnels';
import { TunnelsContextType, useTunnelsContext } from '@lib/contexts/tunnels';
import Label from '@shared/Label';
import StyledInput from '@shared/StyledInput';
import SubmitButton from '@shared/SubmitButton';
import { Tunnel } from '@typedefs/tunnels';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { toast } from 'react-hot-toast';

interface Props {
    action: 'rename' | 'create';
}

interface TunnelAliasModalRef {
    trigger: (callback: () => any, tunnel?: Tunnel) => void;
}

const TunnelAliasModal = forwardRef<TunnelAliasModalRef, Props>(({ action }, ref) => {
    const { tunnelingSecrets } = useTunnelsContext() as TunnelsContextType;

    const [isLoading, setLoading] = useState<boolean>(false);
    const [alias, setAlias] = useState<string>('');

    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

    const [tunnel, setTunnel] = useState<Tunnel>();
    const [callback, setCallback] = useState<(() => any) | null>(null);

    const trigger = (callback: () => any, tunnel?: Tunnel) => {
        setLoading(false);
        setTunnel(tunnel);

        if (tunnel) {
            setAlias(tunnel.alias);
        }

        setCallback(() => callback);
        onOpen();
    };

    useImperativeHandle(ref, () => ({
        trigger,
    }));

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (callback) {
            setLoading(true);

            try {
                if (!tunnelingSecrets) {
                    throw new Error('Tunneling secrets not found.');
                }

                if (action === 'rename' && tunnel) {
                    await renameTunnel(tunnel.id, alias.trim(), tunnelingSecrets);
                } else {
                    await createTunnel(alias.trim(), tunnelingSecrets);
                }

                toast.success(`Tunnel ${action === 'rename' ? 'renamed' : 'created'} successfully.`);
                callback();
                onClose();
            } catch (error) {
                console.error('Error renaming tunnel:', error);
                toast.error('Error renaming tunnel.');
            } finally {
                setLoading(false);
            }
        }
    };

    const getModalTitle = () => {
        return action === 'create' ? 'Create Tunnel' : 'Rename Tunnel';
    };

    const getButtonLabel = () => {
        return action === 'create' ? 'Create' : 'Rename';
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="sm"
            shouldBlockScroll={false}
            classNames={{
                closeButton: 'cursor-pointer',
            }}
        >
            <Form className="w-full" validationBehavior="native" onSubmit={onSubmit}>
                <ModalContent>
                    <ModalHeader>{getModalTitle()}</ModalHeader>

                    <ModalBody>
                        <div className="col w-full gap-2">
                            <Label value="Alias" />

                            <StyledInput
                                autoFocus
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
                                placeholder={action === 'create' ? 'My Tunnel' : 'Enter a new alias'}
                            />
                        </div>
                    </ModalBody>

                    <ModalFooter>
                        <div className="flex justify-end pb-0.5">
                            <SubmitButton label={getButtonLabel()} isLoading={isLoading} />
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Form>
        </Modal>
    );
});

TunnelAliasModal.displayName = 'TunnelAliasModal';

export default TunnelAliasModal;
