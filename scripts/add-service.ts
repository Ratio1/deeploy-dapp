import inquirer from 'inquirer';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

type ServiceInput = {
    id: number;
    name: string;
    description: string;
    image: string;
    port: number;
    inputs: { key: string; label: string }[];
    logo: string;
    color: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVICES_FILE_PATH = path.resolve(__dirname, '../src/data/services.ts');
const SMALL_TAG_FILE_PATH = path.resolve(__dirname, '../src/shared/SmallTag.tsx');

const SERVICES_ARRAY_REGEX = /export default\s*\[(?<arrayContent>[\s\S]*?)\]\s*as Service\[];/;
const COLOR_VARIANTS_REGEX = /export type ColorVariant\s*=\s*(?<variants>[\s\S]*?);/;

const INDENT = '    ';

const sanitizeString = (value: string) => value.trim().replace(/\r?\n/g, ' ').replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const indent = (level: number) => INDENT.repeat(level);

const formatInputs = (inputs: ServiceInput['inputs']) => {
    if (!inputs.length) {
        return `${indent(2)}inputs: [],\n`;
    }

    const formatted = inputs
        .map((input) => `${indent(3)}{ key: '${sanitizeString(input.key)}', label: '${sanitizeString(input.label)}' },`)
        .join('\n');

    return `${indent(2)}inputs: [\n${formatted}\n${indent(2)}],\n`;
};

const formatService = (service: ServiceInput) => {
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
    const inputs: { key: string; label: string }[] = [];

    const { shouldAddInputs } = await inquirer.prompt<{ shouldAddInputs: boolean }>([
        {
            name: 'shouldAddInputs',
            type: 'confirm',
            message: 'Add required environment variables (key/label pairs)?',
            default: false,
        },
    ]);

    if (!shouldAddInputs) {
        return inputs;
    }

    let addAnother = true;

    while (addAnother) {
        const { key, label } = await inquirer.prompt<{ key: string; label: string }>([
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
                message: 'Label (e.g. PostgreSQL Password):',
                validate: (input: string) => (input.trim() ? true : 'Label cannot be empty.'),
                filter: (input: string) => input.trim(),
            },
        ]);

        inputs.push({ key, label });

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

const promptForService = async (nextId: number, colorVariants: string[]): Promise<ServiceInput> => {
    const answers = await inquirer.prompt<{
        name: string;
        description: string;
        image: string;
        port: number;
        logo: string;
        color: string;
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
            message: 'Logo filename (e.g. postgres.svg):',
            validate: (input: string) => (input.trim() ? true : 'Logo cannot be empty.'),
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
    ]);

    const inputs = await promptForInputs();

    return {
        id: nextId,
        name: answers.name,
        description: answers.description,
        image: answers.image,
        port: answers.port,
        inputs,
        logo: answers.logo,
        color: answers.color,
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
    const searchStart = match.index ?? 0;
    const insertionIndex = contents.indexOf('] as Service[];', searchStart);

    if (insertionIndex === -1) {
        throw new Error('Unable to determine insertion point for new service.');
    }

    const nextId = extractNextServiceId(arrayContent);

    return { contents, insertionIndex, nextId };
};

const printSummary = (service: ServiceInput) => {
    const divider = '-'.repeat(40);

    console.log('\nService overview');
    console.log(divider);
    console.log(`ID: ${service.id}`);
    console.log(`Name: ${service.name}`);
    console.log(`Description: ${service.description}`);
    console.log(`Image: ${service.image}`);
    console.log(`Port: ${service.port}`);
    console.log(`Logo: ${service.logo}`);
    console.log(`Color: ${service.color}`);

    if (service.inputs.length) {
        console.log('Inputs:');
        service.inputs.forEach((input, index) => {
            console.log(`  ${index + 1}. key="${input.key}", label="${input.label}"`);
        });
    } else {
        console.log('Inputs: none');
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
        const service = await promptForService(nextId, colorVariants);

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
