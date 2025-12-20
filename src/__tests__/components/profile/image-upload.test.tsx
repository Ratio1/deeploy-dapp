import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ImageUpload from '@components/account/profile/ImageUpload';

const apiMocks = vi.hoisted(() => ({
    uploadProfileImage: vi.fn(),
}));

const utilsMocks = vi.hoisted(() => ({
    resizeImage: vi.fn(),
}));

const toastMocks = vi.hoisted(() => ({
    error: vi.fn(),
    success: vi.fn(),
}));

vi.mock('@lib/utils', () => ({
    resizeImage: utilsMocks.resizeImage,
}));

vi.mock('@lib/api/backend', () => ({
    uploadProfileImage: apiMocks.uploadProfileImage,
}));

vi.mock('react-hot-toast', () => ({
    default: toastMocks,
}));

describe('ImageUpload', () => {
    beforeEach(() => {
        apiMocks.uploadProfileImage.mockResolvedValue({});
        utilsMocks.resizeImage.mockResolvedValue(new Blob(['resized'], { type: 'image/jpeg' }));
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('rejects unsupported file types', async () => {
        const setImageLoading = vi.fn();
        const onSuccessfulUpload = vi.fn();

        const { container } = render(
            <ImageUpload onSuccessfulUpload={onSuccessfulUpload} setImageLoading={setImageLoading} />,
        );

        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        expect(input).toBeTruthy();

        const file = new File(['gif'], 'avatar.gif', { type: 'image/gif' });
        fireEvent.change(input, { target: { files: [file] } });

        expect(setImageLoading).toHaveBeenCalledWith(true);
        expect(setImageLoading).toHaveBeenCalledWith(false);
        expect(toastMocks.error).toHaveBeenCalledWith('Only .jpg, .jpeg, and .png images are allowed.');
        expect(input.value).toBe('');
    });

    it('uploads valid images and calls the success callback', async () => {
        const user = userEvent.setup();
        const setImageLoading = vi.fn();
        const onSuccessfulUpload = vi.fn();

        const { container } = render(
            <ImageUpload onSuccessfulUpload={onSuccessfulUpload} setImageLoading={setImageLoading} />,
        );

        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        expect(input).toBeTruthy();

        const file = new File(['png'], 'avatar.png', { type: 'image/png' });
        await user.upload(input, file);

        await waitFor(() => {
            expect(apiMocks.uploadProfileImage).toHaveBeenCalledWith(expect.any(File));
        });
        const uploadedFile = apiMocks.uploadProfileImage.mock.calls[0]?.[0] as File | undefined;
        expect(uploadedFile?.name).toBe('avatar.png');

        await waitFor(() => {
            expect(onSuccessfulUpload).toHaveBeenCalled();
        });
        expect(setImageLoading).toHaveBeenCalledWith(true);
    });
});
