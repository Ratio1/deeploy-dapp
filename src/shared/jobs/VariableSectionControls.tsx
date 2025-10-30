import { Button } from '@heroui/button';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import toast from 'react-hot-toast';
import { RiAddLine, RiDeleteBin2Line } from 'react-icons/ri';

export default function VariableSectionControls({
    displayLabel,
    addLabel,
    onClick,
    fieldsLength,
    maxFields,
    remove,
}: {
    displayLabel: string;
    addLabel?: string;
    onClick: () => void;
    fieldsLength: number;
    maxFields: number;
    remove: (index?: number | number[]) => void;
}) {
    const { confirm } = useInteractionContext() as InteractionContextType;

    return (
        <div className="row justify-between">
            <div>
                {!fieldsLength && <div className="text-sm text-slate-500 italic">No {displayLabel} added yet.</div>}

                {fieldsLength > 1 && (
                    <div
                        className="compact cursor-pointer text-red-600 hover:opacity-50"
                        onClick={async () => {
                            try {
                                const confirmed = await confirm(<div>Are you sure you want to remove all entries?</div>);

                                if (!confirmed) {
                                    return;
                                }

                                for (let i = fieldsLength - 1; i >= 0; i--) {
                                    remove(i);
                                }
                            } catch (error) {
                                console.error('Error removing all entries:', error);
                                toast.error('Failed to remove all entries.');
                            }
                        }}
                    >
                        <div className="row gap-1">
                            <RiDeleteBin2Line className="text-lg" />
                            <div className="font-medium">Remove all</div>
                        </div>
                    </div>
                )}
            </div>

            {fieldsLength < maxFields && (
                <div className="flex">
                    <Button
                        className="h-[34px] border-2 border-slate-200 bg-white px-2.5 data-[hover=true]:opacity-65!"
                        color="primary"
                        size="sm"
                        variant="flat"
                        onPress={onClick}
                    >
                        <div className="row gap-1">
                            <RiAddLine className="-mx-0.5 text-lg" />
                            <div className="compact">Add {addLabel}</div>
                        </div>
                    </Button>
                </div>
            )}
        </div>
    );
}
