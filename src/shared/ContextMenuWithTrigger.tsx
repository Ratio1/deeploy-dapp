import { Button } from '@heroui/button';
import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from '@heroui/dropdown';
import clsx from 'clsx';
import { PropsWithChildren } from 'react';
import { RiMoreFill } from 'react-icons/ri';

interface Props {
    items: {
        key: string;
        label: string;
        description?: string;
        isDisabled?: boolean;
        isDangerous?: boolean;
        onPress: () => void;
    }[];
    isDisabled?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}

export default function ContextMenuWithTrigger({ items, isDisabled, onOpenChange, children }: PropsWithChildren<Props>) {
    return (
        <Dropdown
            placement="bottom-end"
            shouldBlockScroll={false}
            radius="sm"
            onOpenChange={(isOpen: boolean) => {
                if (onOpenChange) {
                    onOpenChange(isOpen);
                }
            }}
        >
            <DropdownTrigger
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            >
                {children || (
                    <Button
                        className="bg-light h-6 min-w-8 rounded-lg border-slate-200 p-0 data-[hover=true]:opacity-60!"
                        color="default"
                        variant="bordered"
                        disableRipple
                        isDisabled={isDisabled}
                    >
                        <RiMoreFill className="text-lg text-slate-600" />
                    </Button>
                )}
            </DropdownTrigger>

            <DropdownMenu
                aria-label="dropdown"
                variant="flat"
                itemClasses={{
                    base: [
                        'rounded-md',
                        'text-default-500',
                        'transition-opacity',
                        'data-[hover=true]:text-foreground',
                        'data-[hover=true]:bg-slate-100',
                        'data-[selectable=true]:focus:bg-default-50',
                        'data-[pressed=true]:opacity-70',
                        'data-[focus-visible=true]:ring-default-500',
                    ],
                }}
                classNames={{
                    list: 'gap-1',
                    base: 'p-0.5',
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
                disabledKeys={items.filter((item) => item.isDisabled).map((item) => item.key)}
            >
                <DropdownSection className="mb-0 list-none">
                    {items.map((item) => (
                        <DropdownItem key={item.key} onPress={item.onPress} textValue={item.label}>
                            {!item.description ? (
                                <div
                                    className={clsx('font-medium', {
                                        'text-danger': item.key === 'delete' || item?.isDangerous,
                                    })}
                                >
                                    {item.label}
                                </div>
                            ) : (
                                <div className="col gap-1 py-0.5">
                                    <div
                                        className={clsx('text-body leading-none font-medium', {
                                            'text-danger!': item.key === 'delete' || item?.isDangerous,
                                        })}
                                    >
                                        {item.label}
                                    </div>
                                    <div className="max-w-[260px] text-[13px] leading-4 text-slate-500">{item.description}</div>
                                </div>
                            )}
                        </DropdownItem>
                    ))}
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    );
}
