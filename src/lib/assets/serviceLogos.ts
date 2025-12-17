const logoCache = new Map<string, Promise<string | null>>();

function preloadLogo(url: string): Promise<string | null> {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(url);
        image.onerror = () => resolve(null);
        image.src = url;
    });
}

/**
 * Returns the public URL for a service logo.
 */
export async function loadServiceLogo(filename: string): Promise<string | null> {
    if (!filename || typeof window === 'undefined') {
        return null;
    }

    const cachedLogo = logoCache.get(filename);
    if (cachedLogo) {
        return cachedLogo;
    }

    const logoUrl = `/services/${filename}`;
    const logoPromise = preloadLogo(logoUrl).then((resolvedUrl) => {
        if (!resolvedUrl) {
            console.warn(`[loadServiceLogo] Logo not found for filename: ${filename}`);
        }

        return resolvedUrl;
    });

    logoCache.set(filename, logoPromise);
    return logoPromise;
}
