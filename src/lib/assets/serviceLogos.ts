const serviceLogoLoaders = import.meta.glob<{ default: string }>(
    '../../assets/services/*.{svg,png}'
);

const cachedLogos = new Map<string, string>();

/**
 * Lazily loads a service logo from the assets directory.
 */
export async function loadServiceLogo(filename: string): Promise<string | null> {
    const key = `../../assets/services/${filename}`;
    const loader = serviceLogoLoaders[key];

    if (!loader) {
        console.warn(`[loadServiceLogo] Logo not found for filename: ${filename}`);
        return null;
    }

    if (cachedLogos.has(key)) {
        return cachedLogos.get(key) as string;
    }

    const module = (await loader()) as { default: string };
    const logoUrl = module.default;

    cachedLogos.set(key, logoUrl);

    return logoUrl;
}
