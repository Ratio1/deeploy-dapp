import type { Metadata } from 'next';
import { Mona_Sans, Roboto_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import '../src/index.css';

const monaSans = Mona_Sans({
    subsets: ['latin'],
    variable: '--font-mona-sans',
});

const robotoMono = Roboto_Mono({
    subsets: ['latin'],
    weight: ['500'],
    variable: '--font-roboto-mono',
});

export const metadata: Metadata = {
    title: 'Deeploy',
    description: 'Fast app deployment & go-to-market',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" className={`${monaSans.variable} ${robotoMono.variable}`}>
            <body className="bg-light font-mona text-body min-h-screen">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
