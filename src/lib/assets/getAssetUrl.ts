import type { StaticImageData } from 'next/image';

export const getAssetUrl = (asset: string | StaticImageData): string =>
    typeof asset === 'string' ? asset : asset.src;
