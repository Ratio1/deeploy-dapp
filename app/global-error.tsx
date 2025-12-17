'use client';

import { useEffect } from 'react';
import '../src/index.css';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
    useEffect(() => {
        console.error('[app/global-error.tsx]', error);
    }, [error]);

    return (
        <html lang="en">
            <body className="font-mona">
                <div className="center-all min-h-screen p-6">
                    <div className="col w-full max-w-[640px] gap-2 text-center">
                        <div className="text-lg font-semibold">Something went wrong</div>
                        <div className="text-sm text-slate-600">
                            The app hit an unexpected error. Please refresh this page or try again later.
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
