import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import EditPublicProfile from '@components/account/profile/EditPublicProfile';
import { PublicProfileInfo } from '@typedefs/general';
import { config } from '@lib/config';
import { server } from '../../mocks/server';

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('EditPublicProfile', () => {
    const profileInfo: PublicProfileInfo = {
        name: 'Alice',
        description: 'Builder',
        links: {
            Linkedin: 'https://linkedin.com/in/alice',
        },
    };

    beforeEach(() => {
        server.use(
            http.post(`${config.backendUrl}/branding/edit`, () =>
                HttpResponse.json({
                    data: {},
                    error: '',
                }),
            ),
        );
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('submits updated values', async () => {
        const user = userEvent.setup();
        const onEdit = vi.fn();
        let receivedBody: PublicProfileInfo | null = null;

        server.use(
            http.post(`${config.backendUrl}/branding/edit`, async ({ request }) => {
                const json = (await request.json()) as PublicProfileInfo;
                receivedBody = json;
                return HttpResponse.json({
                    data: {},
                    error: '',
                });
            }),
        );

        render(
            <EditPublicProfile
                profileInfo={profileInfo}
                brandingPlatforms={['Linkedin']}
                setEditing={vi.fn()}
                onEdit={onEdit}
            />,
        );

        const nameInput = screen.getByDisplayValue('Alice');
        await user.clear(nameInput);
        await user.type(nameInput, 'Alice Updated');

        const descriptionInput = screen.getByDisplayValue('Builder');
        await user.clear(descriptionInput);
        await user.type(descriptionInput, 'New bio');

        const linkedinInput = screen.getByPlaceholderText('LinkedIn');
        await user.clear(linkedinInput);
        await user.type(linkedinInput, 'https://linkedin.com/in/new');

        await user.click(screen.getByRole('button', { name: /update profile/i }));

        await waitFor(() => {
            expect(receivedBody).toEqual({
                name: 'Alice Updated',
                description: 'New bio',
                links: {
                    Linkedin: 'https://linkedin.com/in/new',
                },
            });
        });

        expect(onEdit).toHaveBeenCalled();
    });

    it('cancels editing', async () => {
        const user = userEvent.setup();
        const setEditing = vi.fn();

        render(
            <EditPublicProfile
                profileInfo={profileInfo}
                brandingPlatforms={['Linkedin']}
                setEditing={setEditing}
                onEdit={vi.fn()}
            />,
        );

        await user.click(screen.getByRole('button', { name: /cancel/i }));
        expect(setEditing).toHaveBeenCalledWith(false);
    });
});
