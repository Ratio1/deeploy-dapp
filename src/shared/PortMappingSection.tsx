import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { RiAddLine, RiDeleteBin6Line } from 'react-icons/ri';

interface PortMappingSectionProps {
    name: string;
    label?: string;
}

export default function PortMappingSection({ name, label = 'Port Mapping' }: PortMappingSectionProps) {
    const { setValue, watch, formState, trigger } = useFormContext();
    const ports = watch(name) || {};
    const [portEntries, setPortEntries] = useState<Array<{ id: string; hostPort: string; containerPort: string }>>(
        Object.entries(ports).map(([hostPort, containerPort], index) => ({
            id: `port-${index}`,
            hostPort,
            containerPort: String(containerPort),
        }))
    );

    const updatePorts = (entries: Array<{ id: string; hostPort: string; containerPort: string }>) => {
        const newPorts: Record<string, string> = {};
        entries.forEach(entry => {
            if (entry.hostPort && entry.containerPort) {
                newPorts[entry.hostPort] = entry.containerPort;
            }
        });
        setValue(name, newPorts);
        trigger(name);
    };

    const addPortMapping = () => {
        const newEntry = {
            id: `port-${Date.now()}`,
            hostPort: '',
            containerPort: '',
        };
        const newEntries = [...portEntries, newEntry];
        setPortEntries(newEntries);
    };

    const removePortMapping = (id: string) => {
        const newEntries = portEntries.filter(entry => entry.id !== id);
        setPortEntries(newEntries);
        updatePorts(newEntries);
    };

    const updateEntry = (id: string, field: 'hostPort' | 'containerPort', value: string) => {
        const newEntries = portEntries.map(entry =>
            entry.id === id ? { ...entry, [field]: value } : entry
        );
        setPortEntries(newEntries);
        updatePorts(newEntries);
    };

    // Check for duplicate host ports
    const hostPorts = portEntries.map(entry => entry.hostPort).filter(port => port);
    const duplicateHostPorts = hostPorts.filter((port, index) => hostPorts.indexOf(port) !== index);
    const hasDuplicateHostPorts = duplicateHostPorts.length > 0;

    return (
        <div className="col gap-3">
            <div className="row items-center justify-between">
                <label className="text-sm font-medium text-gray-700">{label}</label>
            </div>

            <div className="text-warning-800 bg-warning-100 col gap-2 rounded-md p-3 text-sm">
                <div className="font-medium">⚠️ Port Availability Warning</div>
                <div>
                    The plugin may fail to start if the specified host ports are not available on the Edge Node. 
                    Ensure the ports you map are free and accessible.
                </div>
            </div>

            {portEntries.length === 0 && (
                <div className="text-sm text-gray-500 italic">
                    No port mappings configured. Click "Add" to map host ports to container ports.
                </div>
            )}

            {portEntries.map((entry, index) => (
                <div key={entry.id} className="row gap-3 items-end">
                    <div className="flex-1">
                        <Input
                            label="Host Port"
                            placeholder="e.g. 8080"
                            value={entry.hostPort}
                            onChange={(e) => updateEntry(entry.id, 'hostPort', e.target.value)}
                            isInvalid={hasDuplicateHostPorts && duplicateHostPorts.includes(entry.hostPort)}
                            errorMessage={
                                hasDuplicateHostPorts && duplicateHostPorts.includes(entry.hostPort)
                                    ? 'Duplicate host port'
                                    : undefined
                            }
                        />
                    </div>
                    <div className="flex-1">
                        <Input
                            label="Container Port"
                            placeholder="e.g. 8081"
                            value={entry.containerPort}
                            onChange={(e) => updateEntry(entry.id, 'containerPort', e.target.value)}
                        />
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        variant="light"
                        color="danger"
                        isIconOnly
                        onPress={() => removePortMapping(entry.id)}
                    >
                        <RiDeleteBin6Line />
                    </Button>
                </div>
            ))}

            {portEntries.length > 0 && (
                <div className="text-xs text-gray-500">
                    Format: host_port:container_port (e.g., 8080:8081)
                </div>
            )}

            {hasDuplicateHostPorts && (
                <div className="text-danger-600 text-sm">
                    ⚠️ Duplicate host ports detected. Each host port must be unique.
                </div>
            )}

            <div
                className="row compact text-primary cursor-pointer gap-0.5 hover:opacity-50"
                onClick={addPortMapping}
            >
                <RiAddLine className="text-lg" /> Add
            </div>
        </div>
    );
}
