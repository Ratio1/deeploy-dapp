import fs from 'fs';
import services, { Service } from '../src/data/services';

const errors: string[] = [];

for (const s of services as Service[]) {
    if (typeof s.id !== 'number') {
        errors.push(`${s.name}: invalid ID`);
    }
    if (!s.name) {
        errors.push(`Missing name`);
    }
    if (s.description.length > 100) {
        errors.push(`${s.name}: Description too long`);
    }
    if (!s.logo.endsWith('.svg') || !s.logo.endsWith('.png')) {
        errors.push(`${s.name}: Invalid logo image extension`);
    }
    if (!fs.existsSync(`src/assets/logos/${s.logo}`)) {
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
    console.log('✅ All services pass validation');
}
