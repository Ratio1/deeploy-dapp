import { getApps } from '@lib/api/deeploy';
import { signAndBuildDeeployRequest } from '@lib/cash/backend-wallet';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const request = await signAndBuildDeeployRequest();
        const response = await getApps(request);

        if (!response.apps || response.status === 'fail') {
            const message = response.error ?? 'Failed to fetch apps from Deeploy.';
            return NextResponse.json({ error: message }, { status: 502 });
        }

        return NextResponse.json({ apps: response.apps });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected error while fetching apps.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
