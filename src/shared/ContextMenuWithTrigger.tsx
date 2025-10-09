import { Button } from '@heroui/button';
import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from '@heroui/dropdown';
import clsx from 'clsx';
import { RiMoreFill } from 'react-icons/ri';

interface Props {
    items: {
        key: string;
        label: string;
        description?: string;
        onPress: () => void;
    }[];
    isDisabled?: boolean;
}

export default function ContextMenuWithTrigger({ items, isDisabled }: Props) {
    return (
        <Dropdown placement="bottom-end" shouldBlockScroll={false} radius="sm">
            <DropdownTrigger
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            >
                <Button
                    className="bg-light h-6 min-w-8 rounded-lg border-slate-200 p-0 data-[hover=true]:opacity-50!"
                    color="default"
                    variant="bordered"
                    disableRipple
                    isDisabled={isDisabled}
                >
                    <RiMoreFill className="text-lg text-slate-600" />
                </Button>
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
            >
                <DropdownSection className="mb-0 list-none">
                    {items.map((item) => (
                        <DropdownItem key={item.key} onPress={item.onPress} textValue={item.label}>
                            {!item.description ? (
                                <div
                                    className={clsx('font-medium', {
                                        'text-danger': item.key === 'delete',
                                    })}
                                >
                                    {item.label}
                                </div>
                            ) : (
                                <div className="col">
                                    <div className="text-body font-medium">{item.label}</div>
                                    <div className="text-[13px] text-slate-500">{item.description}</div>
                                </div>
                            )}
                        </DropdownItem>
                    ))}
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    );
}
