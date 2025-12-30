import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import NotFoundPage from '../../../app/(public)/404/page';

describe('404 page', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the 404 message', () => {
        render(<NotFoundPage />);

        expect(screen.getByText('404')).toBeInTheDocument();
        expect(
            screen.getByText("The page or resource you're trying to reach is invalid or it doesn't exist anymore"),
        ).toBeInTheDocument();
    });
});
