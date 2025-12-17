'use client';

import { DetailedAlert } from '@shared/DetailedAlert';
import { useEffect } from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error('[app/error.tsx]', error);
    }, [error]);

    return (
        <div className="flex w-full flex-1 justify-center pt-24">
            <DetailedAlert
                variant="red"
                icon={<RiErrorWarningLine />}
                title="Something went wrong"
                description={
                    <div>
                        An unexpected error occurred. Please try again, or return to the home page.
                        {process.env.NODE_ENV === 'development' && (
                            <div className="col gap-1 px-3 py-2 pt-2 font-mono text-sm">
                                <div>{error.message}</div>
                                {!!error.digest && <div className="text-slate-500">{error.digest}</div>}
                            </div>
                        )}
                    </div>
                }
                fullWidth
            />
        </div>
    );
}
