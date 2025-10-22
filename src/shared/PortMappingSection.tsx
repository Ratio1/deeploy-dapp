import ConfigSectionTitle from '@components/job/config/ConfigSectionTitle';
import StyledInput from '@shared/StyledInput';
import VariableSectionRemove from '@shared/jobs/VariableSectionRemove';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { RiAddLine } from 'react-icons/ri';
import DeeployWarning from './jobs/DeeployWarning';

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
        })),
    );

    const updatePorts = (entries: Array<{ id: string; hostPort: string; containerPort: string }>) => {
        const newPorts: Record<string, string> = {};
        entries.forEach((entry) => {
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
        const newEntries = portEntries.filter((entry) => entry.id !== id);
        setPortEntries(newEntries);
        updatePorts(newEntries);
    };

    const updateEntry = (id: string, field: 'hostPort' | 'containerPort', value: string) => {
        const newEntries = portEntries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry));
        setPortEntries(newEntries);
        updatePorts(newEntries);
    };

    // Check for duplicate host ports
    const hostPorts = portEntries.map((entry) => entry.hostPort).filter((port) => port);
    const duplicateHostPorts = hostPorts.filter((port, index) => hostPorts.indexOf(port) !== index);
    const hasDuplicateHostPorts = duplicateHostPorts.length > 0;

    return (
        <div className="col gap-3">
            <ConfigSectionTitle title={label} />

            <DeeployWarning
                title={<div>Port Availability</div>}
                description={
                    <div>
                        The plugin may fail to start if the specified host ports are not available on your target nodes. Ensure
                        the ports you map are free and accessible.
                    </div>
                }
            />

            {portEntries.length === 0 && <div className="text-sm text-gray-500 italic">No port mappings added yet.</div>}

            {portEntries.map((entry, index) => (
                <div key={entry.id} className="row items-end gap-3">
                    <div className="flex-1">
                        <StyledInput
                            placeholder="e.g., 8080"
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
                        <StyledInput
                            placeholder="e.g., 8081"
                            value={entry.containerPort}
                            onChange={(e) => updateEntry(entry.id, 'containerPort', e.target.value)}
                        />
                    </div>
                    <VariableSectionRemove onClick={() => removePortMapping(entry.id)} />
                </div>
            ))}

            {portEntries.length > 0 && (
                <div className="text-sm text-slate-500">
                    Format: <span className="font-medium uppercase">host_port:container_port</span>
                </div>
            )}

            {hasDuplicateHostPorts && (
                <div className="text-danger-600 text-sm">⚠️ Duplicate host ports detected. Each host port must be unique.</div>
            )}

            {/* TODO: Use append */}
            <div className="row compact text-primary cursor-pointer gap-0.5 hover:opacity-50" onClick={addPortMapping}>
                <RiAddLine className="text-lg" /> Add
            </div>
        </div>
    );
}
