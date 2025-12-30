import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import SupportPage from '../../../app/(protected)/support/page';

describe('Support page', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the support placeholder', () => {
        render(<SupportPage />);

        expect(screen.getByText('Support')).toBeInTheDocument();
    });
});
