import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import services, { Service } from '../src/data/services';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logosDir = path.resolve(__dirname, '../src/assets/services');

const errors: string[] = [];

for (const s of services as Service[]) {
    if (isNaN(s.port)) {
        errors.push(`${s.name}: invalid ID`);
    }
    if (s.description.length > 100) {
        errors.push(`${s.name}: Description too long`);
    }
    if (!(s.logo.endsWith('.svg') || s.logo.endsWith('.png'))) {
        errors.push(`${s.name}: Invalid logo image extension`);
    }

    const logoPath = path.join(logosDir, s.logo);
    if (!fs.existsSync(logoPath)) {
        errors.push(`${s.name}: logo file not found`);
    }
    if (isNaN(s.port)) {
        errors.push(`${s.name}: port must be number`);
    }
}

if (errors.length) {
    console.error('❌ Validation failed:\n' + errors.map((e) => `- ${e}`).join('\n'));
    process.exit(1);
} else {
    console.log('✅ All services are valid');
}
