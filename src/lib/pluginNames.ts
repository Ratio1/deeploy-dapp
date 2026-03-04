import { BasePluginType, GenericPlugin, Plugin, PluginType } from '@typedefs/steps/deploymentStepTypes';

const PLUGIN_TYPE_LABELS: Record<PluginType, string> = {
    [PluginType.Native]: 'native-plugin',
    [PluginType.Container]: 'container-app-runner',
    [PluginType.Worker]: 'worker-app-runner',
};

export function getPluginType(plugin: Plugin): PluginType {
    if (plugin.basePluginType === BasePluginType.Native) {
        return PluginType.Native;
    }
    return (plugin as GenericPlugin).deploymentType.pluginType;
}

export function getPluginName(plugin: Plugin, index: number): string {
    if (plugin.pluginName) return plugin.pluginName;
    // fallback for old data without pluginName
    return `${PLUGIN_TYPE_LABELS[getPluginType(plugin)]}-${index + 1}`;
}

export function generatePluginName(existingPlugins: Plugin[], pluginType: PluginType): string {
    const label = PLUGIN_TYPE_LABELS[pluginType];
    const prefix = `${label}-`;
    const existingIndices = existingPlugins
        .filter((p) => p.pluginName?.startsWith(prefix))
        .map((p) => parseInt(p.pluginName!.substring(prefix.length)))
        .filter((n) => !isNaN(n));
    const nextIndex = existingIndices.length > 0 ? Math.max(...existingIndices) + 1 : 1;
    return `${prefix}${nextIndex}`;
}

export function isContainerizedPlugin(plugin: Plugin): boolean {
    if (plugin.basePluginType === BasePluginType.Native) {
        return false;
    }
    return true;
}
