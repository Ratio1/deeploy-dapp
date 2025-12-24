import { CspEscrowAbi } from '@blockchain/CspEscrow';
import { getCashPublicClient, getCashWalletClient } from '@lib/cash/chain';
import { CashExtendJobDurationPayload, CashExtendJobDurationResponse } from '@lib/cash/types';
import { config, getCurrentEpoch } from '@lib/config';
import { diffTimeFn } from '@lib/deeploy-utils';
import { isZeroAddress } from '@lib/utils';
import { addDays } from 'date-fns';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const buildLastExecutionEpoch = (lastExecutionEpoch: string, durationMonths: number) => {
    const expiryDate = addDays(new Date(), durationMonths * 30);
    const durationInEpochs = diffTimeFn(expiryDate, new Date());
    const currentEpoch = getCurrentEpoch();
    const previousExecutionEpoch = Number(lastExecutionEpoch);

    if (!Number.isFinite(previousExecutionEpoch)) {
        throw new Error('Invalid lastExecutionEpoch.');
    }

    return BigInt(Math.max(currentEpoch, previousExecutionEpoch) + durationInEpochs);
};

export async function POST(request: Request) {
    let payload: CashExtendJobDurationPayload | null = null;

    try {
        payload = (await request.json()) as CashExtendJobDurationPayload;
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    if (!payload?.jobId || !payload.lastExecutionEpoch || typeof payload.durationMonths !== 'number') {
        return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (!Number.isFinite(payload.durationMonths) || payload.durationMonths <= 0) {
        return NextResponse.json({ error: 'Invalid durationMonths.' }, { status: 400 });
    }

    try {
        const escrowContractAddress = config.escrowContractAddress;

        if (!escrowContractAddress || isZeroAddress(escrowContractAddress)) {
            return NextResponse.json({ error: 'Missing escrow contract address configuration.' }, { status: 500 });
        }

        const jobId = BigInt(payload.jobId);
        const lastExecutionEpoch = buildLastExecutionEpoch(payload.lastExecutionEpoch, payload.durationMonths);

        const walletClient = getCashWalletClient();
        const publicClient = getCashPublicClient();

        const txHash = await walletClient.writeContract({
            address: escrowContractAddress as `0x${string}`,
            abi: CspEscrowAbi,
            functionName: 'extendJobDuration',
            args: [jobId, lastExecutionEpoch],
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

        const responseBody: CashExtendJobDurationResponse = {
            status: receipt.status,
        };

        return NextResponse.json(responseBody);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected error while extending job duration.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
