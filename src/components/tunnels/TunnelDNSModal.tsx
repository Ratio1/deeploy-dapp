import { Button } from '@heroui/button';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@heroui/modal';
import { CopyableValue } from '@shared/CopyableValue';
import { forwardRef, useImperativeHandle, useState } from 'react';

interface TunnelDNSModalRef {
    trigger: (hostname: string, url: string) => void;
}

const TunnelDNSModal = forwardRef<TunnelDNSModalRef>((_, ref) => {
    const [hostname, setHostname] = useState<string>();
    const [url, setUrl] = useState<string>();

    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    const trigger = (hostname: string, url: string) => {
        setHostname(hostname);
        setUrl(url);
        onOpen();
    };

    useImperativeHandle(ref, () => ({
        trigger,
    }));

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md" shouldBlockScroll={false}>
            <ModalContent>
                <ModalHeader>DNS Record</ModalHeader>

                <ModalBody>
                    <div className="col w-full gap-3 text-sm">
                        <div>
                            To link <span className="font-medium">{hostname}</span> to{' '}
                            <span className="font-medium">{url}</span>, add the following DNS record:
                        </div>

                        <div className="col gap-1 rounded bg-slate-100 p-3">
                            <div>
                                <span className="font-medium">Type:</span> CNAME
                            </div>

                            <CopyableValue value={hostname as string}>
                                <div>
                                    <span className="font-medium">Host:</span> {hostname}
                                </div>
                            </CopyableValue>

                            <CopyableValue value={url as string}>
                                <div>
                                    <span className="font-medium">Value:</span> {url}
                                </div>
                            </CopyableValue>
                        </div>

                        <div className="italic text-slate-500">
                            After updating your DNS, it may take some time for the changes to propagate.
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <div className="flex justify-end pb-0.5">
                        <Button className="slate-button" color="default" variant="flat" onPress={onClose}>
                            <div className="text-sm font-medium">Close</div>
                        </Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
});

TunnelDNSModal.displayName = 'TunnelDNSModal';

export default TunnelDNSModal;
