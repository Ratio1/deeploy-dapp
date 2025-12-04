import inquirer from 'inquirer';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { Service } from '../src/data/services';
import {
    DynamicEnvVarsEntry,
    DynamicEnvVarValue,
    KeyLabelEntry,
    KeyValueEntry,
} from '../src/typedefs/steps/deploymentStepTypes';

type PluginSignature = 'CONTAINER_APP_RUNNER' | 'WORKER_APP_RUNNER';
type TunnelEngine = 'cloudflare' | 'ngrok';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVICES_FILE_PATH = path.resolve(__dirname, '../src/data/services.ts');
const SMALL_TAG_FILE_PATH = path.resolve(__dirname, '../src/shared/SmallTag.tsx');
const DYNAMIC_ENV_TYPES_FILE_PATH = path.resolve(__dirname, '../src/data/dynamicEnvTypes.ts');

const SERVICES_ARRAY_REGEX = /const services:\s*Service\[\]\s*=\s*\[(?<arrayContent>[\s\S]*?)\];/;
const COLOR_VARIANTS_REGEX = /export type ColorVariant\s*=\s*(?<variants>[\s\S]*?);/;
const DYNAMIC_ENV_TYPES_REGEX = /export const DYNAMIC_ENV_TYPES\s*=\s*\[(?<types>[\s\S]*?)\]\s*as const;/;

const PLUGIN_SIGNATURE_CHOICES: PluginSignature[] = ['CONTAINER_APP_RUNNER', 'WORKER_APP_RUNNER'];
const TUNNEL_ENGINE_CHOICES: TunnelEngine[] = ['cloudflare', 'ngrok'];
const ALLOWED_LOGO_EXTENSIONS = ['.svg', '.png'];

const INDENT = '    ';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

const colorValue = (value: unknown) => `${CYAN}${String(value)}${RESET}`;

const sanitizeString = (value: string) => value.trim().replace(/\r?\n/g, ' ').replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const indent = (level: number) => INDENT.repeat(level);

const formatInputs = (inputs: Service['inputs']) => {
    if (!inputs.length) {
        return `${indent(2)}inputs: [],\n`;
    }

    const formatted = inputs
        .map((input) => {
            let entry = `${indent(3)}{ key: '${sanitizeString(input.key)}', label: '${sanitizeString(input.label)}'`;
            if (input.description) {
                entry += `, description: '${sanitizeString(input.description)}'`;
            }
            if (input.placeholder) {
                entry += `, placeholder: '${sanitizeString(input.placeholder)}'`;
            }
            entry += ' },';
            return entry;
        })
        .join('\n');

    return `${indent(2)}inputs: [\n${formatted}\n${indent(2)}],\n`;
};

const formatEnvVars = (envVars: KeyValueEntry[] | undefined) => {
    if (!envVars?.length) {
        return '';
    }

    const formatted = envVars
        .map((entry) => `${indent(3)}{ key: '${sanitizeString(entry.key)}', value: '${sanitizeString(entry.value)}' },`)
        .join('\n');

    return `${indent(2)}envVars: [\n${formatted}\n${indent(2)}],\n`;
};

const formatDynamicEnvVars = (dynamicEnvVars: DynamicEnvVarsEntry[] | undefined) => {
    if (!dynamicEnvVars?.length) {
        return '';
    }

    const formatted = dynamicEnvVars
        .map((entry) => {
            const values = entry.values
                .map(
                    (value) =>
                        `${indent(5)}{ type: '${sanitizeString(value.type)}', value: '${sanitizeString(value.value)}' },`,
                )
                .join('\n');

            return (
                `${indent(3)}{\n` +
                `${indent(4)}key: '${sanitizeString(entry.key)}',\n` +
                `${indent(4)}values: [\n${values}\n${indent(4)}],\n` +
                `${indent(3)}},`
            );
        })
        .join('\n');

    return `${indent(2)}dynamicEnvVars: [\n${formatted}\n${indent(2)}],\n`;
};

const formatCommands = (commands: string[] | undefined) => {
    if (!commands?.length) {
        return '';
    }
    const formatted = commands.map((command) => `${indent(3)}'${sanitizeString(command)}',`).join('\n');

    return `${indent(2)}buildAndRunCommands: [\n${formatted}\n${indent(2)}],\n`;
};

const formatJsonField = (fieldName: string, value: unknown) => {
    if (value === undefined) {
        return '';
    }

    const json = JSON.stringify(value, null, 4);

    if (!json.includes('\n')) {
        return `${indent(2)}${fieldName}: ${json},\n`;
    }

    const lines = json.split('\n');
    const formattedLines = lines
        .map((line, index) => {
            if (index === 0) {
                return `${indent(2)}${fieldName}: ${line}`;
            }
            if (index === lines.length - 1) {
                return `${indent(2)}${line},`;
            }
            return `${indent(3)}${line}`;
        })
        .join('\n');

    return `${formattedLines}\n`;
};

const formatService = (service: Service) => {
    return (
        `${indent(1)}{\n` +
        `${indent(2)}id: ${service.id},\n` +
        `${indent(2)}name: '${sanitizeString(service.name)}',\n` +
        `${indent(2)}description: '${sanitizeString(service.description)}',\n` +
        `${indent(2)}image: '${sanitizeString(service.image)}',\n` +
        `${indent(2)}port: ${service.port},\n` +
        formatInputs(service.inputs) +
        `${indent(2)}logo: '${sanitizeString(service.logo)}',\n` +
        `${indent(2)}color: '${sanitizeString(service.color)}',\n` +
        `${indent(2)}pluginSignature: '${service.pluginSignature}',\n` +
        `${indent(2)}tunnelEngine: '${service.tunnelEngine}',\n` +
        formatEnvVars(service.envVars) +
        formatDynamicEnvVars(service.dynamicEnvVars) +
        formatCommands(service.buildAndRunCommands) +
        formatJsonField('pipelineParams', service.pipelineParams) +
        formatJsonField('pluginParams', service.pluginParams) +
        `${indent(1)}},\n`
    );
};

const extractColorVariants = () => {
    const contents = readFileSync(SMALL_TAG_FILE_PATH, 'utf8');
    const match = contents.match(COLOR_VARIANTS_REGEX);

    if (!match?.groups?.variants) {
        throw new Error('Unable to locate ColorVariant definitions in src/shared/SmallTag.tsx');
    }

    return match.groups.variants
        .split('|')
        .map((variant) => variant.replace(/['"`]/g, '').trim())
        .filter(Boolean);
};

const extractDynamicEnvTypes = () => {
    const contents = readFileSync(DYNAMIC_ENV_TYPES_FILE_PATH, 'utf8');
    const match = contents.match(DYNAMIC_ENV_TYPES_REGEX);

    if (!match?.groups?.types) {
        throw new Error('Unable to locate DYNAMIC_ENV_TYPES definitions in src/data/dynamicEnvTypes.ts');
    }

    return match.groups.types
        .split(',')
        .map((type) => type.replace(/['"`]/g, '').trim())
        .filter(Boolean);
};

const buildColorPromptMessage = (variants: string[]) => {
    if (!variants.length) {
        return 'Color (e.g. blue):';
    }

    const formattedVariants = variants.map((variant) => `  • ${variant}`).join('\n');

    return `Color (e.g. blue):\nAvailable variants:\n${formattedVariants}\n`;
};

const extractNextServiceId = (servicesArray: string) => {
    const matches = [...servicesArray.matchAll(/id:\s*(\d+)/g)].map((match) => Number(match[1]));
    const maxId = matches.length ? Math.max(...matches) : 0;
    return maxId + 1;
};

const promptForInputs = async () => {
    const inputs: KeyLabelEntry[] = [];

    const { shouldAddInputs } = await inquirer.prompt<{ shouldAddInputs: boolean }>([
        {
            name: 'shouldAddInputs',
            type: 'confirm',
            message: 'Add required UI inputs (key/label pairs)?',
            default: false,
        },
    ]);

    if (!shouldAddInputs) {
        return inputs;
    }

    let addAnother = true;

    while (addAnother) {
        const { key, label, description, placeholder } = await inquirer.prompt<{
            key: string;
            label: string;
            description: string;
            placeholder: string;
        }>([
            {
                name: 'key',
                type: 'input',
                message: 'Key (e.g. POSTGRES_PASSWORD):',
                validate: (input: string) => (input.trim() ? true : 'Key cannot be empty.'),
                filter: (input: string) => input.trim(),
            },
            {
                name: 'label',
                type: 'input',
                message: 'Label (e.g. Password):',
                validate: (input: string) => (input.trim() ? true : 'Label cannot be empty.'),
                filter: (input: string) => input.trim(),
            },
            {
                name: 'description',
                type: 'input',
                message: 'Description (optional, leave empty to skip):',
                filter: (input: string) => input.trim(),
            },
            {
                name: 'placeholder',
                type: 'input',
                message: 'Placeholder example (optional, leave empty to skip):',
                filter: (input: string) => input.trim(),
            },
        ]);

        const input: KeyLabelEntry = { key, label };
        if (description) input.description = description;
        if (placeholder) input.placeholder = placeholder;

        inputs.push(input);

        const response = await inquirer.prompt<{ continueAdding: boolean }>([
            {
                name: 'continueAdding',
                type: 'confirm',
                message: 'Add another input?',
                default: true,
            },
        ]);

        addAnother = response.continueAdding;
    }

    return inputs;
};

const promptForEnvVars = async (): Promise<KeyValueEntry[]> => {
    const envVars: KeyValueEntry[] = [];

    const { shouldAddEnvVars } = await inquirer.prompt<{ shouldAddEnvVars: boolean }>([
        {
            name: 'shouldAddEnvVars',
            type: 'confirm',
            message: 'Add static environment variables (key/value pairs)?',
            default: false,
        },
    ]);

    if (!shouldAddEnvVars) {
        return envVars;
    }

    let addAnother = true;

    while (addAnother) {
        const { key, value } = await inquirer.prompt<{ key: string; value: string }>([
            {
                name: 'key',
                type: 'input',
                message: 'ENV var key:',
                validate: (input: string) => (input.trim() ? true : 'Key cannot be empty.'),
                filter: (input: string) => input.trim(),
            },
            {
                name: 'value',
                type: 'input',
                message: 'ENV var value:',
                validate: (input: string) => (input.trim() ? true : 'Value cannot be empty.'),
                filter: (input: string) => input.trim(),
            },
        ]);

        envVars.push({ key, value });

        const response = await inquirer.prompt<{ continueAdding: boolean }>([
            {
                name: 'continueAdding',
                type: 'confirm',
                message: 'Add another environment variable?',
                default: true,
            },
        ]);

        addAnother = response.continueAdding;
    }

    return envVars;
};

const promptForDynamicEnvValue = async (index: number, typeOptions: string[]): Promise<DynamicEnvVarValue> => {
    let typeResponse: { type: string };

    if (typeOptions.length > 0) {
        typeResponse = await inquirer.prompt<{ type: string }>([
            {
                name: 'type',
                type: 'list',
                message: `Dynamic value ${index} type:`,
                choices: typeOptions,
                default: typeOptions[0],
            },
        ]);
    } else {
        typeResponse = await inquirer.prompt<{ type: string }>([
            {
                name: 'type',
                type: 'input',
                message: `Dynamic value ${index} type:`,
                validate: (input: string) => (input.trim() ? true : 'Type cannot be empty.'),
                filter: (input: string) => input.trim(),
            },
        ]);
    }

    const { value } = await inquirer.prompt<{ value: string }>([
        {
            name: 'value',
            type: 'input',
            message: `Dynamic value ${index}:`,
            validate: (input: string) => (input.trim() ? true : 'Value cannot be empty.'),
            filter: (input: string) => input.trim(),
        },
    ]);

    return { type: typeResponse.type, value };
};

const promptForDynamicEnvVars = async (typeOptions: string[]): Promise<DynamicEnvVarsEntry[]> => {
    const dynamicEnvVars: DynamicEnvVarsEntry[] = [];

    const { shouldAddDynamicEnvVars } = await inquirer.prompt<{ shouldAddDynamicEnvVars: boolean }>([
        {
            name: 'shouldAddDynamicEnvVars',
            type: 'confirm',
            message: 'Add dynamic environment variables (each entry requires exactly 3 typed values)?',
            default: false,
        },
    ]);

    if (!shouldAddDynamicEnvVars) {
        return dynamicEnvVars;
    }

    let addAnother = true;

    while (addAnother) {
        const { key } = await inquirer.prompt<{ key: string }>([
            {
                name: 'key',
                type: 'input',
                message: 'Dynamic ENV variable key:',
                validate: (input: string) => (input.trim() ? true : 'Key cannot be empty.'),
                filter: (input: string) => input.trim(),
            },
        ]);

        const values: DynamicEnvVarsEntry['values'] = [
            await promptForDynamicEnvValue(1, typeOptions),
            await promptForDynamicEnvValue(2, typeOptions),
            await promptForDynamicEnvValue(3, typeOptions),
        ];

        dynamicEnvVars.push({ key, values });

        const response = await inquirer.prompt<{ continueAdding: boolean }>([
            {
                name: 'continueAdding',
                type: 'confirm',
                message: 'Add another dynamic ENV variable?',
                default: true,
            },
        ]);

        addAnother = response.continueAdding;
    }

    return dynamicEnvVars;
};

const promptForCommands = async (): Promise<string[]> => {
    const commands: string[] = [];

    const { shouldAddCommands } = await inquirer.prompt<{ shouldAddCommands: boolean }>([
        {
            name: 'shouldAddCommands',
            type: 'confirm',
            message: 'Add build and run commands?',
            default: false,
        },
    ]);

    if (!shouldAddCommands) {
        return commands;
    }

    let addAnother = true;

    while (addAnother) {
        const { command } = await inquirer.prompt<{ command: string }>([
            {
                name: 'command',
                type: 'input',
                message: 'Command:',
                validate: (input: string) => (input.trim() ? true : 'Command cannot be empty.'),
                filter: (input: string) => input.trim(),
            },
        ]);

        commands.push(command);

        const response = await inquirer.prompt<{ continueAdding: boolean }>([
            {
                name: 'continueAdding',
                type: 'confirm',
                message: 'Add another command?',
                default: true,
            },
        ]);

        addAnother = response.continueAdding;
    }

    return commands;
};

const promptForJsonField = async (fieldLabel: string): Promise<unknown | undefined> => {
    const { shouldAdd } = await inquirer.prompt<{ shouldAdd: boolean }>([
        {
            name: 'shouldAdd',
            type: 'confirm',
            message: `Add ${fieldLabel}?`,
            default: false,
        },
    ]);

    if (!shouldAdd) {
        return undefined;
    }

    const { jsonValue } = await inquirer.prompt<{ jsonValue: string }>([
        {
            name: 'jsonValue',
            type: 'input',
            message: `${fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1)} JSON (e.g. {"key":"value"}). Leave empty for {}:`,
            validate: (input: string) => {
                const trimmed = input.trim();
                if (!trimmed) {
                    return true;
                }

                try {
                    JSON.parse(trimmed);
                    return true;
                } catch {
                    return 'Invalid JSON. Please provide a valid JSON object or array.';
                }
            },
        },
    ]);

    const trimmed = jsonValue.trim();

    if (!trimmed) {
        return {};
    }

    return JSON.parse(trimmed);
};

const promptForService = async (nextId: number, colorVariants: string[], dynamicEnvTypes: string[]): Promise<Service> => {
    const answers = await inquirer.prompt<{
        name: string;
        description: string;
        image: string;
        port: number;
        logo: string;
        color: string;
        pluginSignature: PluginSignature;
        tunnelEngine: TunnelEngine;
    }>([
        {
            name: 'name',
            type: 'input',
            message: 'Service name:',
            validate: (input: string) => (input.trim() ? true : 'Name cannot be empty.'),
            filter: (input: string) => input.trim(),
        },
        {
            name: 'description',
            type: 'input',
            message: 'Service description (max 100 chars):',
            validate: (input: string) => {
                const trimmed = input.trim();

                if (!trimmed) {
                    return 'Description cannot be empty.';
                }

                if (trimmed.length > 100) {
                    return 'Description must be 100 characters or fewer.';
                }

                return true;
            },
            filter: (input: string) => input.trim(),
        },
        {
            name: 'image',
            type: 'input',
            message: 'Container image (e.g. postgres:17):',
            validate: (input: string) => (input.trim() ? true : 'Image cannot be empty.'),
            filter: (input: string) => input.trim(),
        },
        {
            name: 'port',
            type: 'input',
            message: 'Exposed port:',
            validate: (input: string) => {
                const parsed = Number(input);
                if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
                    return 'Port must be an integer between 1 and 65535.';
                }
                return true;
            },
            filter: (input: string) => Number(input),
        },
        {
            name: 'logo',
            type: 'input',
            message: `Logo filename (allowed: ${ALLOWED_LOGO_EXTENSIONS.join(', ')}):`,
            validate: (input: string) => {
                const trimmed = input.trim();

                if (!trimmed) {
                    return 'Logo cannot be empty.';
                }

                const extension = path.extname(trimmed).toLowerCase();

                if (!ALLOWED_LOGO_EXTENSIONS.includes(extension)) {
                    return `Image must be of type: ${ALLOWED_LOGO_EXTENSIONS.join(', ')}.`;
                }

                return true;
            },
            filter: (input: string) => input.trim(),
        },
        {
            name: 'color',
            type: 'input',
            message: buildColorPromptMessage(colorVariants),
            validate: (input: string) => {
                const trimmed = input.trim();

                if (!trimmed) {
                    return 'Color cannot be empty.';
                }

                if (colorVariants.length && !colorVariants.includes(trimmed)) {
                    return `Invalid color. Choose one of: ${colorVariants.join(', ')}.`;
                }

                return true;
            },
            filter: (input: string) => input.trim(),
        },
        {
            name: 'pluginSignature',
            type: 'list',
            message: 'Plugin signature:',
            choices: PLUGIN_SIGNATURE_CHOICES,
            default: PLUGIN_SIGNATURE_CHOICES[0],
        },
        {
            name: 'tunnelEngine',
            type: 'list',
            message: 'Tunnel engine:',
            choices: TUNNEL_ENGINE_CHOICES,
            default: TUNNEL_ENGINE_CHOICES[0],
        },
    ]);

    const inputs = await promptForInputs();
    const envVars = await promptForEnvVars();
    const dynamicEnvVars = await promptForDynamicEnvVars(dynamicEnvTypes);
    const buildAndRunCommands = await promptForCommands();
    const pipelineParams = await promptForJsonField('pipeline parameters');
    const pluginParams = await promptForJsonField('root plugin paramaters (will be available in the root plugin object)');

    return {
        id: nextId,
        name: answers.name,
        description: answers.description,
        image: answers.image,
        port: answers.port,
        inputs,
        logo: answers.logo,
        color: answers.color,
        pluginSignature: answers.pluginSignature,
        tunnelEngine: answers.tunnelEngine,
        envVars,
        dynamicEnvVars,
        buildAndRunCommands,
        pipelineParams,
        pluginParams,
    };
};

const readServicesFile = () => {
    const contents = readFileSync(SERVICES_FILE_PATH, 'utf8');
    const match = contents.match(SERVICES_ARRAY_REGEX);

    if (!match) {
        throw new Error('Unable to locate service array in src/data/services.ts');
    }

    const { groups } = match;

    if (!groups?.arrayContent) {
        throw new Error('Unable to locate service array in src/data/services.ts');
    }

    const arrayContent = groups.arrayContent;
    const matchStart = match.index ?? 0;
    const insertionIndex = matchStart + match[0].length - 2; // position before the closing ];

    if (!Number.isFinite(insertionIndex) || insertionIndex < matchStart) {
        throw new Error('Unable to determine insertion point for new service.');
    }

    const nextId = extractNextServiceId(arrayContent);

    return { contents, insertionIndex, nextId };
};

const printSummary = (service: Service) => {
    const divider = '-'.repeat(40);

    console.log('\nService overview');
    console.log(divider);
    console.log(`ID: ${colorValue(service.id)}`);
    console.log(`Name: ${colorValue(service.name)}`);
    console.log(`Description: ${colorValue(service.description)}`);
    console.log(`Image: ${colorValue(service.image)}`);
    console.log(`Port: ${colorValue(service.port)}`);
    console.log(`Logo: ${colorValue(service.logo)}`);
    console.log(`Color: ${colorValue(service.color)}`);
    console.log(`Plugin signature: ${colorValue(service.pluginSignature)}`);
    console.log(`Tunnel engine: ${colorValue(service.tunnelEngine)}`);

    if (service.inputs.length) {
        console.log('Inputs:');
        service.inputs.forEach((input, index) => {
            let line = `  ${index + 1}. key="${colorValue(input.key)}", label="${colorValue(input.label)}"`;
            if (input.description) line += `, description="${colorValue(input.description)}"`;
            if (input.placeholder) line += `, placeholder="${colorValue(input.placeholder)}"`;
            console.log(line);
        });
    } else {
        console.log(`Inputs: ${colorValue('[] (none)')}`);
    }

    if (service.envVars?.length) {
        console.log('Environment variables:');
        service.envVars.forEach((entry, index) => {
            console.log(`  ${index + 1}. key="${colorValue(entry.key)}", value="${colorValue(entry.value)}"`);
        });
    } else {
        console.log(`Environment variables: ${colorValue('[] (none)')}`);
    }

    if (service.dynamicEnvVars?.length) {
        console.log('Dynamic environment variables:');
        service.dynamicEnvVars.forEach((entry, index) => {
            console.log(`  ${index + 1}. key="${colorValue(entry.key)}"`);
            entry.values.forEach((value, valueIndex) => {
                console.log(`     - [${valueIndex + 1}] type="${colorValue(value.type)}", value="${colorValue(value.value)}"`);
            });
        });
    } else {
        console.log(`Dynamic environment variables: ${colorValue('[] (none)')}`);
    }

    if (service.buildAndRunCommands?.length) {
        console.log('Build and run commands:');
        service.buildAndRunCommands.forEach((command, index) => {
            console.log(`  ${index + 1}. ${colorValue(command)}`);
        });
    } else {
        console.log(`Build and run commands: ${colorValue('[] (none)')}`);
    }

    if (service.pipelineParams !== undefined) {
        console.log('Pipeline parameters:');
        console.log(colorValue(JSON.stringify(service.pipelineParams, null, 2)));
    } else {
        console.log(`Pipeline parameters: ${colorValue('{} (none)')}`);
    }

    if (service.pluginParams !== undefined) {
        console.log('Root plugin paramaters:');
        console.log(colorValue(JSON.stringify(service.pluginParams, null, 2)));
    } else {
        console.log(`Root plugin paramaters: ${colorValue('{} (none)')}`);
    }

    console.log(divider);
};

const appendService = (contents: string, insertionIndex: number, serviceSnippet: string) => {
    return contents.slice(0, insertionIndex) + serviceSnippet + contents.slice(insertionIndex);
};

const main = async () => {
    try {
        const { contents, insertionIndex, nextId } = readServicesFile();
        const colorVariants = extractColorVariants();
        const dynamicEnvTypes = extractDynamicEnvTypes();
        const service = await promptForService(nextId, colorVariants, dynamicEnvTypes);

        printSummary(service);

        const { confirmAdd } = await inquirer.prompt<{ confirmAdd: boolean }>([
            {
                name: 'confirmAdd',
                type: 'confirm',
                message: 'Add this service to src/data/services.ts?',
                default: true,
            },
        ]);

        if (!confirmAdd) {
            console.log('Aborted. No changes were made.');
            return;
        }

        const serviceSnippet = formatService(service);
        const updatedContents = appendService(contents, insertionIndex, serviceSnippet);

        writeFileSync(SERVICES_FILE_PATH, updatedContents, 'utf8');

        console.log(`Service "${service.name}" added successfully.`);
    } catch (error) {
        console.error((error as Error).message);
        process.exitCode = 1;
    }
};

void main();
