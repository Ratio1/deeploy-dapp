import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/modal';
import { BillingInfo } from '@typedefs/general';
import { useState } from 'react';

interface Props {
    billingInfo: BillingInfo;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onClose: () => void;
    onSave: () => void;
}

export const BillingInfoModal = ({ billingInfo, isOpen, onOpenChange, onClose, onSave }: Props) => {
    const [companyName, setCompanyName] = useState<BillingInfo['companyName']>(billingInfo.companyName);

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md" shouldBlockScroll={false}>
            <ModalContent>
                <ModalHeader>Update your billing information</ModalHeader>

                <ModalBody className="pt-2">
                    <div className="col gap-6">
                        <div className="col gap-4">
                            <Input
                                value={companyName}
                                onValueChange={(value) => {
                                    setCompanyName(value);
                                }}
                                size="md"
                                classNames={{
                                    inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                                    input: 'font-medium',
                                }}
                                variant="bordered"
                                labelPlacement="outside"
                                label="Company Name"
                                placeholder="Company Name"
                            />

                            <Input
                                value={companyName}
                                onValueChange={(value) => {
                                    setCompanyName(value);
                                }}
                                size="md"
                                classNames={{
                                    inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                                    input: 'font-medium',
                                }}
                                variant="bordered"
                                labelPlacement="outside"
                                label="Email"
                                placeholder="Email"
                            />
                        </div>

                        <div className="row w-full justify-end pb-4">
                            <Button color="primary" onPress={onSave}>
                                Save
                            </Button>
                        </div>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
