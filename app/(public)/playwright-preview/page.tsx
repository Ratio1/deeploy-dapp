import { notFound } from 'next/navigation';

/*
Use this public route to render UI components without login and take deterministic screenshots with
Playwright.

Temporarily replace the code inside section id="playwright-preview"
with the component under test and keep external API/blockchain dependencies mocked.
*/

const isDevelopment = process.env.NODE_ENV === 'development';

export default function PlaywrightPreviewPage() {
    if (!isDevelopment) {
        notFound();
    }

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 p-6 md:p-10">
            <header className="space-y-3">
                <h1 className="text-3xl font-semibold text-slate-900">Playwright Preview</h1>
            </header>

            <section id="playwright-preview" className="mx-auto w-full max-w-3xl"></section>
        </main>
    );
}
