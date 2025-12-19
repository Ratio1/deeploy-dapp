import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { keccak256, toBytes } from 'viem';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { COLOR_TYPES } from '@data/colorTypes';
import { routePath } from '@lib/routes/route-paths';
import CreateProject from '../../../app/(protected)/deeploys/create-project/page';

const mocks = vi.hoisted(() => ({
    addProject: vi.fn(),
    push: vi.fn(),
}));

vi.mock('@lib/storage/db', () => ({
    default: {
        projects: {
            add: mocks.addProject,
        },
    },
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mocks.push,
    }),
}));

describe('CreateProject', () => {
    beforeEach(() => {
        mocks.addProject.mockReset();
        mocks.addProject.mockResolvedValue(1);
        mocks.push.mockReset();
    });

    it('creates a project and navigates to the draft page', async () => {
        const user = userEvent.setup();
        const uuid = '11111111-1111-1111-1111-111111111111';

        vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(uuid);

        render(<CreateProject />);

        await user.type(screen.getByPlaceholderText('Project'), 'MyProject');

        const submitButton = await screen.findByRole('button', { name: /create project/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(mocks.addProject).toHaveBeenCalled();
        });

        const projectHash = keccak256(toBytes(uuid));

        expect(mocks.addProject).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'MyProject',
                color: COLOR_TYPES[0].hex,
                projectHash,
            }),
        );

        expect(mocks.push).toHaveBeenCalledWith(`${routePath.deeploys}/${routePath.projectDraft}/${projectHash}`);
    });
});
