import { Button } from '@heroui/button';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/dropdown';
import { RiMoreFill } from 'react-icons/ri';

interface Props {
    items: {
        key: string;
        label: string;
        description: string;
        icon: React.ReactNode;
        onPress: () => void;
    }[];
}

export default function ContextMenuWithTrigger({ items }: Props) {
    return (
        <Dropdown placement="bottom-end" shouldBlockScroll={false} radius="sm">
            <DropdownTrigger>
                <Button
                    className="h-6 min-w-8 rounded-lg border-slate-200 bg-light p-0"
                    color="default"
                    variant="bordered"
                    disableRipple
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
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            >
                {items.map((item) => (
                    <DropdownItem key={item.key} onPress={item.onPress}>
                        <div className="row gap-2">
                            <div className="pr-0.5 text-[26px] text-slate-500">{item.icon}</div>

                            <div className="col">
                                <div className="font-medium leading-4">{item.label}</div>
                                <div className="text-[13px] text-slate-500">{item.description}</div>
                            </div>
                        </div>
                    </DropdownItem>
                ))}

                {/* <DropdownItem
                    key="downloadJson"
                    onPress={() => {
                        console.log('downloadJson');
                    }}
                >
                    <div className="row gap-2">
                        <RiFileCodeLine className="pr-0.5 text-[26px] text-slate-500" />

                        <div className="col">
                            <div className="font-medium leading-4">Download JSON</div>
                            <div className="text-[13px] text-slate-500">Exports the job as a JSON file</div>
                        </div>
                    </div>
                </DropdownItem>

                <DropdownItem
                    key="delete"
                    onPress={() => {
                        console.log('delete');
                    }}
                >
                    <div className="row gap-2">
                        <RiDeleteBinLine className="pr-0.5 text-[26px] text-slate-500" />

                        <div className="col">
                            <div className="font-medium leading-4">Delete</div>
                            <div className="text-[13px] text-slate-500">Removes the job from the project</div>
                        </div>
                    </div>
                </DropdownItem> */}
            </DropdownMenu>
        </Dropdown>
    );
}
