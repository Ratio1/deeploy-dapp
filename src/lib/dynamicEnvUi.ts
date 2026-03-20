import { CUSTOM_PLUGIN_SIGNATURE } from '@data/pluginSignatureTypes';
import { getPluginSemaphoreKeyOptions } from '@data/pluginSemaphoreKeys';
import { BasePluginType, GenericPlugin, NativePlugin, Plugin, PluginType } from '@typedefs/steps/deploymentStepTypes';

export type AvailableDynamicEnvPlugin = {
    name: string;
    basePluginType: BasePluginType;
    signature?: string;
};

export const getDynamicEnvProviderSignature = (plugin: Plugin) => {
    if (plugin.basePluginType === BasePluginType.Native) {
        const nativePlugin = plugin as NativePlugin;
        return nativePlugin.pluginSignature === CUSTOM_PLUGIN_SIGNATURE
            ? nativePlugin.customPluginSignature ?? CUSTOM_PLUGIN_SIGNATURE
            : nativePlugin.pluginSignature;
    }

    const genericPlugin = plugin as GenericPlugin;
    return genericPlugin.deploymentType.pluginType === PluginType.Container ? 'CONTAINER_APP_RUNNER' : 'WORKER_APP_RUNNER';
};

export const getDynamicEnvKeyOptionsForProvider = (
    availablePlugins: AvailableDynamicEnvPlugin[] | undefined,
    providerName: string | undefined,
) => {
    if (!availablePlugins || !providerName) {
        return undefined;
    }

    const provider = availablePlugins.find((plugin) => plugin.name === providerName);
    return getPluginSemaphoreKeyOptions(provider?.signature);
};

export const shouldUseManualDynamicEnvKeyForProvider = (
    availablePlugins: AvailableDynamicEnvPlugin[] | undefined,
    providerName: string | undefined,
) => {
    return !getDynamicEnvKeyOptionsForProvider(availablePlugins, providerName);
};
