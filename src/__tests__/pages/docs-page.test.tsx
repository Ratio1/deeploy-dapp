import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import DocsPage from '../../../app/(protected)/docs/page';

describe('Docs page', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the docs placeholder', () => {
        render(<DocsPage />);

        expect(screen.getByText('Docs')).toBeInTheDocument();
    });
});
