import { Button } from '@heroui/button';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@heroui/modal';
import Label from '@shared/Label';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { RiCheckLine, RiFileCopyLine } from 'react-icons/ri';

interface TunnelTokenModalRef {
    trigger: (token: string, alias?: string) => void;
}

const TunnelTokenModal = forwardRef<TunnelTokenModalRef>((_, ref) => {
    const [copied, setCopied] = useState(false);

    const [alias, setAlias] = useState<string>();
    const [token, setToken] = useState<string>();

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    // Init
    useEffect(() => {}, []);

    const trigger = (token: string, alias?: string) => {
        setToken(token);
        setAlias(alias);
        onOpen();
    };

    useImperativeHandle(ref, () => ({
        trigger,
    }));

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm" shouldBlockScroll={false}>
            <ModalContent>
                <ModalHeader>Tunnel Token</ModalHeader>

                <ModalBody>
                    <div className="col w-full gap-4">
                        {alias && (
                            <div className="col gap-1">
                                <Label value="Alias" />
                                <div className="truncate text-sm font-medium">{alias}</div>
                            </div>
                        )}

                        <div className="col gap-2">
                            <Label value="Token" />
                            <div className="select-all break-all rounded bg-slate-100 p-3 font-mono text-xs">{token}</div>
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <div className="flex justify-end pb-0.5">
                        <Button
                            color="primary"
                            variant="flat"
                            onPress={async () => {
                                if (token) {
                                    navigator.clipboard.writeText(token);
                                    setCopied(true);
                                    setTimeout(() => {
                                        setCopied(false);
                                    }, 1000);
                                }
                            }}
                        >
                            <div className="row gap-1.5">
                                <div className="text-lg">{!copied ? <RiFileCopyLine /> : <RiCheckLine />}</div>
                                <div className="text-sm font-medium">{copied ? 'Copied!' : 'Copy'}</div>
                            </div>
                        </Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
});

TunnelTokenModal.displayName = 'TunnelTokenModal';

export default TunnelTokenModal;
